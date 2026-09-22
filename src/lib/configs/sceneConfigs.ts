interface SceneConfigs {
  ENVIRONMENT_HDR_URL: string
  BACKGROUND_COLOR: string
  FOG_NEAR: number
  FOG_FAR: number
  ENVIRONMENT_INTENSITY: number
}

const sceneConfigs: SceneConfigs = {
  ENVIRONMENT_HDR_URL: '/para_ground_glare_fog.hdr',
  ENVIRONMENT_INTENSITY: 0.45,
  BACKGROUND_COLOR: '#d4d4d4', //'#bcbcbc',
  FOG_NEAR: 180,
  FOG_FAR: 260

}

export default sceneConfigs