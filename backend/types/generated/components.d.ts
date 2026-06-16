import type { Schema, Struct } from '@strapi/strapi';

export interface MissionObjectif extends Struct.ComponentSchema {
  collectionName: 'components_mission_objectifs';
  info: {
    displayName: 'Objectif';
    icon: 'check-square';
  };
  attributes: {
    description: Schema.Attribute.Text;
    progress: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface MissionStat extends Struct.ComponentSchema {
  collectionName: 'components_mission_stats';
  info: {
    displayName: 'Statistique';
    icon: 'chart-bar';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'mission.objectif': MissionObjectif;
      'mission.stat': MissionStat;
    }
  }
}
