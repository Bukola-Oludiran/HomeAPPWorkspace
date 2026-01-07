# New Components Needed

Based on the UpcomingTasks.md analysis, the following items require **new components or pages** to be created.

---

## New Pages Required

| Page | Route | Purpose | Priority |
|------|-------|---------|----------|
| PrivacyPolicyPage | `/privacy` | Legal privacy policy | Medium |
| TermsOfServicePage | `/terms` | Terms of service | Medium |
| SupportPage | `/support` | Help center / contact support | Medium |
| CommunityPage | `/community` | Tenant community features | Low |
| LandlordsDirectoryPage | `/landlords` | Browse landlords | Low |

---

## New Modal Components

### 1. NotificationsDropdown
**Files that need it:** HomePage, SearchPage, TenantLayout, LandlordLayout, AgentLayout  
**Functionality:**
- Display list of recent notifications
- Mark as read
- Clear all
- Link to full notifications page

```
/src/components/NotificationsDropdown.tsx
```

---

### 2. ShareModal
**Files that need it:** AgentPublicProfile, LandlordPublicProfile, PropertyDetail  
**Functionality:**
- Copy link to clipboard
- Share via social media buttons
- Generate QR code

```
/src/components/ShareModal.tsx
```

---

### 3. ContactAgentModal
**Files that need it:** AgentPublicProfile, PropertyDetail  
**Functionality:**
- Send message to agent
- Subject and message fields
- Optional phone callback request

```
/src/components/ContactAgentModal.tsx
```

---

### 4. ReviewModal
**Files that need it:** LandlordPublicProfile, AgentPublicProfile, TenantPublicProfile  
**Functionality:**
- Star rating selector
- Text review input
- Submit/cancel

```
/src/components/ReviewModal.tsx
```

---

### 5. CalendarSyncModal
**Files that need it:** AgentSchedule  
**Functionality:**
- Connect Google Calendar
- Connect Outlook
- Sync settings

```
/src/components/CalendarSyncModal.tsx
```

---

### 6. NotificationPreferencesModal
**Files that need it:** AgentSchedule, SettingsPage  
**Functionality:**
- Toggle email notifications
- Toggle push notifications
- Notification frequency settings

```
/src/components/NotificationPreferencesModal.tsx
```

---

### 7. AddAvailabilityModal
**Files that need it:** AgentSchedule  
**Functionality:**
- Date/time picker
- Recurring availability option
- Save/cancel

```
/src/components/AddAvailabilityModal.tsx
```

---

### 8. FilterDropdown (Generic)
**Files that need it:** AgentMyJobs, AgentTransactions, reviews sections  
**Functionality:**
- Reusable filter dropdown
- Checkbox options
- Clear/apply buttons

```
/src/components/FilterDropdown.tsx
```

---

### 9. ExportModal
**Files that need it:** AgentTransactions, LandlordTransactions, TenantTransactions  
**Functionality:**
- Export format selection (CSV, PDF, Excel)
- Date range selector
- Download trigger

```
/src/components/ExportModal.tsx
```

---

## New Reusable UI Components

### 10. FavoriteButton
**Files that need it:** HomePage, SearchPage, TenantSavedProperties, PropertyDetail  
**Functionality:**
- Toggle favorite state
- API integration for saving
- Visual feedback animation
- Login prompt if not authenticated

```
/src/components/FavoriteButton.tsx
```

---

### 11. VoiceInputButton
**Files that need it:** BuyFlowModal, ScheduleViewingModal, AIChatPage  
**Functionality:**
- Start/stop voice recording
- Visual feedback (pulse animation)
- Transcription display
- Stub implementation (can be "Coming soon" toast)

```
/src/components/VoiceInputButton.tsx
```

---

### 12. FileUploadZone
**Files that need it:** MaintenanceRequestModal, SignLeaseRenewalModal, RentalApplicationWizard  
**Functionality:**
- Drag and drop support
- Click to browse
- File preview with remove
- File type validation

```
/src/components/FileUploadZone.tsx
```

---

### 13. DocumentZoomControls
**Files that need it:** SignLeaseRenewalModal, DocumentViewerModal  
**Functionality:**
- Zoom in/out buttons
- Zoom percentage display
- Fit to width option

```
/src/components/DocumentZoomControls.tsx
```

---

### 14. MonthNavigator
**Files that need it:** ScheduleViewingModal, AgentSchedule  
**Functionality:**
- Previous/next month arrows
- Current month/year display
- Optional jump-to-date

```
/src/components/MonthNavigator.tsx
```

---

## Summary

| Type | Count |
|------|-------|
| New Pages | 5 |
| New Modals | 9 |
| New Reusable Components | 5 |
| **Total** | **19** |

---

## Recommended Creation Order

### Phase 1: High-Impact Reusables
1. `NotificationsDropdown` - Used in 5+ places
2. `FavoriteButton` - Used in 4+ places
3. `FilterDropdown` - Used in 3+ places

### Phase 2: Profile Features
4. `ShareModal`
5. `ContactAgentModal`
6. `ReviewModal`

### Phase 3: Document/Calendar Features
7. `MonthNavigator`
8. `FileUploadZone`
9. `DocumentZoomControls`
10. `CalendarSyncModal`
11. `AddAvailabilityModal`

### Phase 4: Settings & Pages
12. `NotificationPreferencesModal`
13. `ExportModal`
14. `VoiceInputButton`
15. Legal pages (Privacy, Terms, Support)

### Phase 5: Low Priority
16. CommunityPage
17. LandlordsDirectoryPage
