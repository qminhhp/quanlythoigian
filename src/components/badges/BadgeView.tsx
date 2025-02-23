import { useState, useEffect } from "react";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Crown, Target, Zap, Award } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
  user_id: string;
}

interface UserLevel {
  level: number;
  experience: number;
  user_id: string;
}

const ICONS: Record<string, React.ReactNode> = {
  trophy: <Trophy className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
};

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  streak: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  total: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  completions: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  special: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
};

export default function BadgeView() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 1,
    experience: 0,
    user_id: "",
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch all badges
      const { data: badgesData } = await supabase
        .from<Badge>("badges")
        .orderBy("requirement_value", true)
        .get();

      // Fetch user's earned badges
      const { data: userBadgesData } = await supabase
        .from<UserBadge>("user_badges")
        .where("user_id", user.id)
        .get();

      // Fetch user's level
      const { data: userLevelData } = await supabase
        .from<UserLevel>("user_levels")
        .where("user_id", user.id)
        .first();

      setBadges(badgesData || []);
      setUserBadges(userBadgesData || []);
      if (userLevelData) {
        setUserLevel(userLevelData);
      }
    };

    fetchData();
  }, [user]);

  const groupedBadges = badges.reduce<Record<string, Badge[]>>((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {});

  const experienceToNextLevel = (level: number) => level * 100;
  const progress =
    ((userLevel.experience % 100) / experienceToNextLevel(userLevel.level)) *
    100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Level Progress */}
        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Level {userLevel.level}</h2>
              <p className="text-indigo-100">
                Experience: {userLevel.experience} XP
              </p>
            </div>
            <Crown className="w-12 h-12 text-yellow-300" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userLevel.level + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-indigo-200" />
          </div>
        </Card>

        {/* Badges by Category */}
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
            <Card key={category} className="p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {category} Badges
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {categoryBadges.map((badge) => {
                  const earned = userBadges.some(
                    (ub) => ub.badge_id === badge.id,
                  );
                  const colors = COLORS[badge.category];

                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg border ${earned ? colors.border : "border-gray-200"} 
                      ${earned ? colors.bg : "bg-gray-50"} transition-colors duration-200`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-2 rounded-full ${earned ? colors.bg : "bg-gray-100"}`}
                        >
                          {ICONS[badge.icon] || <Award className="w-6 h-6" />}
                        </div>
                        {earned && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-600">
                            Earned!
                          </span>
                        )}
                      </div>
                      <h4
                        className={`mt-3 font-medium ${earned ? colors.text : "text-gray-600"}`}
                      >
                        {badge.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {badge.description}
                      </p>
                      {!earned && (
                        <div className="mt-2">
                          <Progress
                            value={
                              (userLevel.experience / badge.requirement_value) *
                              100
                            }
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
