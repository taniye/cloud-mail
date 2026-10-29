// Default to administrator-provisioned accounts, including OAuth registration.
export function isPrivateDeployment(env) {
  return env.private_mode !== false && env.private_mode !== 'false';
}
