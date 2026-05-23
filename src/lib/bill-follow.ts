export function getBillFollowButtonLabel(isFollowing: boolean) {
  return isFollowing ? "Unfollow updates" : "Follow updates";
}

export function getBillFollowEmptyMessage() {
  return "Follow public bills to receive activity updates when the discussion changes.";
}
