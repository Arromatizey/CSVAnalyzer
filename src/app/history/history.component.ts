import { Component, OnInit } from '@angular/core';
import { Storage } from 'aws-amplify/storage';

interface S3File {
  key: string;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  reports: { name: string, url: string }[] = [];

  async ngOnInit() {
    await this.loadReports();
  }

  async loadReports() {
    try {
      // Fetch the list of files from S3
      const result: S3File[] = await Storage.list('', { level: 'public' });

      this.reports = await Promise.all(
        result.map(async (file: S3File) => {
          if (!file.key) return null; // Ensure file has a valid key
          const signedUrl = await Storage.get(file.key, { level: 'public' });
          return { name: file.key, url: signedUrl };
        })
      );

      // Remove any null values from the list
      this.reports = this.reports.filter(report => report !== null);

    } catch (error) {
      console.error("Erreur de chargement des rapports :", error);
    }
  }

  openReport(url: string) {
    window.open(url, '_blank');
  }
}
