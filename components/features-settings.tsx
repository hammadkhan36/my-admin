// "use client";

// import { useFeatures } from "@/components/features-provider";
// import { featureGroups } from "@/lib/features-config";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// export function FeaturesSettings() {
//   const { features, toggleFeature } = useFeatures();

//   return (
//     <div className="space-y-6">
//       {featureGroups.map((group) => (
//         <Card key={group.label}>
//           <CardHeader>
//             <CardTitle>{group.label}</CardTitle>
//             <CardDescription>Enable/disable modules for this section</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {group.items.map((item) => (
//               <div key={item.key} className="flex items-center justify-between">
//                 <Label htmlFor={`feature-${item.key}`}>{item.label}</Label>
//                 <Switch
//                   id={`feature-${item.key}`}
//                   checked={features[item.key]}
//                   onCheckedChange={() => toggleFeature(item.key)}
//                 />
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }



"use client";

import { featureGroups, Features, FeatureKey } from "@/lib/features-config";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Props = {
  features: Features;
  onToggle: (key: FeatureKey) => void;
};

export function FeaturesSettings({ features, onToggle }: Props) {
  return (
    <div className="space-y-6">
      {featureGroups.map((group) => (
        <Card key={group.label}>
          <CardHeader>
            <CardTitle>{group.label}</CardTitle>
            <CardDescription>Enable/disable modules for this section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label htmlFor={`feature-${item.key}`}>{item.label}</Label>
                <Switch
                  id={`feature-${item.key}`}
                  checked={features[item.key]}
                  onCheckedChange={() => onToggle(item.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}