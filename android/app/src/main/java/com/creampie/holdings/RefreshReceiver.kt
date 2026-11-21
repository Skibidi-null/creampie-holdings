package com.creampie.holdings

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

/** Tap "updated HH:MM" on a widget, or unlock the phone: fetch fresh prices now. */
class RefreshReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) = now(ctx, intent.action == Intent.ACTION_USER_PRESENT)
    companion object {
        fun now(ctx: Context, onlyIfOld: Boolean = false) {
            if (onlyIfOld && System.currentTimeMillis() - Store.prefs(ctx).getLong("wUpdated", 0) < 5 * 60_000L) return
            WorkManager.getInstance(ctx).enqueueUniqueWork("alerts-now", ExistingWorkPolicy.KEEP,
                OneTimeWorkRequestBuilder<AlertWorker>().setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build())
        }
    }
}
