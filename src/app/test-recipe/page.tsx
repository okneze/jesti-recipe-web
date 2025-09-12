import React from 'react';
import Recipe from '@/app/components/Recipe';
import { RecipeType } from '@/app/lib/Recipedata';

const testRecipe: RecipeType = {
  meta: {
    path: 'test-recipe.md',
    slug: 'test/test-recipe',
    author: 'test',
    repository: 'recipes',
    branch: 'main',
  },
  title: 'Gefüllte Pljeskavica mit Käse',
  imagePath: '',
  description: `Eine wunderbare traditionelle Pljeskavica mit köstlicher Käsefüllung. Diese gefüllte Variante des klassischen Balkanhacksteaks ist besonders saftig und geschmackvoll. Die Kombination aus würzigem Hackfleisch und cremigem Käse macht dieses Gericht zu einem echten Highlight auf dem Grill oder in der Pfanne. Sehr lange Sätze die umgebrochen werden müssen um zu testen ob die Textumbrüche funktionieren.`,
  tags: ['balkan', 'fleisch', 'grill'],
  yields: '4 Portionen',
  ingredients: `- 500g gemischtes Hackfleisch (halb Rind, halb Schwein)
- 150g Käse (Feta oder Gouda), gewürfelt
- 1 große Zwiebel, fein gehackt
- 2 Knoblauchzehen, gepresst
- 1 TL Paprikapulver
- 1/2 TL Kreuzkümmel
- Salz und Pfeffer nach Geschmack
- 2 EL Olivenöl`,
  instructions: `Die Pljeskavica zubereiten beginnt mit der gründlichen Vermischung des Hackfleischs mit den Gewürzen. Dies ist ein sehr wichtiger Schritt der nicht übersprungen werden sollte da die Gewürze gleichmäßig verteilt werden müssen für den optimalen Geschmack der später beim Grillen oder Braten entsteht und das Fleisch richtig würzig macht.

Den Käse in kleine Würfel schneiden und beiseite stellen. Das Hackfleisch mit Zwiebeln, Knoblauch und allen Gewürzen gründlich vermengen und etwa 30 Minuten im Kühlschrank ruhen lassen damit sich die Aromen gut verbinden können.

Aus der Fleischmasse etwa 8 dünne Fladen formen. Auf die Hälfte der Fladen den gewürfelten Käse verteilen und mit den anderen Fladen bedecken. Die Ränder gut verschließen damit der Käse beim Garen nicht ausläuft und die Pljeskavica ihre Form behält.

Die gefüllten Pljeskavica in einer heißen Pfanne mit etwas Olivenöl oder auf dem Grill bei mittlerer Hitze etwa 4-5 Minuten pro Seite braten bis sie goldbraun und durchgegart sind. Dabei darauf achten dass sie nicht zu schnell anbräunen da sonst der Käse im Inneren nicht richtig schmilzt.

Servieren Sie die Pljeskavica heiß mit frischem Brot, Zwiebeln und einem gemischten Salat. Ein traditioneller Ajvar oder eine würzige Paprikacreme passen hervorragend dazu und runden das Gericht perfekt ab.`,
  language: 'german',
  score: 0,
};

export default function TestRecipePage() {
  return <Recipe recipe={testRecipe} />;
}