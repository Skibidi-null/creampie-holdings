package com.creampie.holdings

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

const val SITE = "https://skibidi-null.github.io/creampie-holdings/"

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannels(listOf(
            NotificationChannel(Notifier.CH_GOLD, "Gold price alerts", NotificationManager.IMPORTANCE_HIGH).apply { description = "Gold below your target or big drops" },
            NotificationChannel(Notifier.CH_NEWS, "Gold news (hot gossip)", NotificationManager.IMPORTANCE_DEFAULT).apply { description = "Headlines that could move gold" },
            NotificationChannel(Notifier.CH_REMIND, "Reminders", NotificationManager.IMPORTANCE_DEFAULT).apply { description = "Card bill & 9 pm reminder" },
        ))
        schedule()
    }

    fun schedule() {
        val req = PeriodicWorkRequestBuilder<AlertWorker>(15, TimeUnit.MINUTES)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("alerts", ExistingPeriodicWorkPolicy.KEEP, req)
    }
}
