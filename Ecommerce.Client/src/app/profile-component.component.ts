import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfilesService } from './profiles-service';
import { AccountService } from './account-service';
import {
  IAddressDto,
  IJsonPatchOperation,
  IProfileResponse
} from './shared/modules/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-component.component.html',
  styleUrl: './profile-component.component.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profilesService = inject(ProfilesService);
  private accountService = inject(AccountService);

  profile: IProfileResponse | null = null;
  address: IAddressDto | null = null;
  twoFaEnabled = false;

  isLoadingProfile = false;
  isLoadingAddress = false;
  isSavingProfile = false;
  isSavingAddress = false;
  isUploadingImage = false;
  isChangingPassword = false;
  isSettingPassword = false;
  isDeletingProfile = false;
  isSaving2fa = false;

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [''],
    gender: [''],
  });

  addressForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['', Validators.required],
    phoneNumber: ['', Validators.required],
  });

  changePasswordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
  });

  setPasswordForm = this.fb.group({
    password: ['', Validators.required],
  });

  deleteProfileForm = this.fb.group({
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadProfile();
    this.loadAddress();
    this.load2faStatus();
  }

  loadProfile(): void {
    this.isLoadingProfile = true;
    this.profilesService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          gender: profile.gender,
        });
        this.isLoadingProfile = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoadingProfile = false;
      },
    });
  }

  loadAddress(): void {
    this.isLoadingAddress = true;
    this.profilesService.getAddress().subscribe({
      next: (address) => {
        this.address = address;
        this.addressForm.patchValue(address);
        this.isLoadingAddress = false;
      },
      error: (err) => {
        console.error('Failed to load address', err);
        this.isLoadingAddress = false;
      },
    });
  }

  load2faStatus(): void {
    this.profilesService.get2FAStatus().subscribe({
      next: (status) => {
        this.twoFaEnabled = status;
      },
      error: (err) => {
        console.error('Failed to load 2FA status', err);
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.profile) return;

    const formValue = this.profileForm.value;
    const ops: IJsonPatchOperation[] = [];

    if (formValue.firstName !== this.profile.firstName) {
      ops.push({ op: 'replace', path: '/firstName', value: formValue.firstName });
    }
    if (formValue.lastName !== this.profile.lastName) {
      ops.push({ op: 'replace', path: '/lastName', value: formValue.lastName });
    }
    if (formValue.phoneNumber !== this.profile.phoneNumber) {
      ops.push({ op: 'replace', path: '/phoneNumber', value: formValue.phoneNumber });
    }
    if (formValue.gender !== this.profile.gender) {
      ops.push({ op: 'replace', path: '/gender', value: formValue.gender });
    }

    if (ops.length === 0) return;

    this.isSavingProfile = true;
    this.profilesService.updateProfileJsonPatch(ops).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.profileForm.patchValue({
          firstName: updated.firstName,
          lastName: updated.lastName,
          phoneNumber: updated.phoneNumber,
          gender: updated.gender,
        });
        this.updateLocalUserBasics(updated.firstName, updated.lastName);
        this.isSavingProfile = false;
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.isSavingProfile = false;
      },
    });
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;

    this.isSavingAddress = true;
    const dto = this.addressForm.value as IAddressDto;
    this.profilesService.updateAddress(dto).subscribe({
      next: (updated) => {
        this.address = updated;
        this.addressForm.patchValue(updated);
        this.isSavingAddress = false;
      },
      error: (err) => {
        console.error('Failed to update address', err);
        this.isSavingAddress = false;
      },
    });
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingImage = true;
    this.profilesService.updateProfileImage(file).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.accountService.updateLocalUserProfilePicture(updated.profilePictureUrl ?? null);
        this.isUploadingImage = false;
        input.value = '';
      },
      error: (err) => {
        console.error('Failed to update profile image', err);
        this.isUploadingImage = false;
      },
    });
  }

  deleteProfileImage(): void {
    this.isUploadingImage = true;
    this.profilesService.deleteProfileImage().subscribe({
      next: (updated) => {
        this.profile = updated;
        this.accountService.updateLocalUserProfilePicture(null);
        this.isUploadingImage = false;
      },
      error: (err) => {
        console.error('Failed to delete profile image', err);
        this.isUploadingImage = false;
      },
    });
  }

  changePassword(): void {
    if (this.changePasswordForm.invalid) return;
    const oldPassword = this.changePasswordForm.value.oldPassword ?? '';
    const newPassword = this.changePasswordForm.value.newPassword ?? '';
    if (!oldPassword || !newPassword) return;

    this.isChangingPassword = true;
    this.profilesService.changePassword({ oldPassword, newPassword }).subscribe({
      next: () => {
        this.changePasswordForm.reset();
        this.isChangingPassword = false;
      },
      error: (err) => {
        console.error('Failed to change password', err);
        this.isChangingPassword = false;
      },
    });
  }

  setPassword(): void {
    if (this.setPasswordForm.invalid) return;
    const password = this.setPasswordForm.value.password ?? '';
    if (!password) return;

    this.isSettingPassword = true;
    this.profilesService.setPassword({ password }).subscribe({
      next: () => {
        this.setPasswordForm.reset();
        this.isSettingPassword = false;
      },
      error: (err) => {
        console.error('Failed to set password', err);
        this.isSettingPassword = false;
      },
    });
  }

  deleteProfile(): void {
    if (this.deleteProfileForm.invalid) return;
    const password = this.deleteProfileForm.value.password ?? '';
    if (!password) return;

    this.isDeletingProfile = true;
    this.profilesService.deleteProfile({ password }).subscribe({
      next: () => {
        this.isDeletingProfile = false;
        this.accountService.logout();
      },
      error: (err) => {
        console.error('Failed to delete profile', err);
        this.isDeletingProfile = false;
      },
    });
  }

  toggle2fa(): void {
    this.isSaving2fa = true;
    this.profilesService.enable2FA({ enable: !this.twoFaEnabled }).subscribe({
      next: () => {
        this.twoFaEnabled = !this.twoFaEnabled;
        this.isSaving2fa = false;
      },
      error: (err) => {
        console.error('Failed to update 2FA', err);
        this.isSaving2fa = false;
      },
    });
  }

  private updateLocalUserBasics(firstName: string, lastName: string): void {
    if (typeof localStorage === 'undefined') return;
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      user.firstName = firstName;
      user.lastName = lastName;
      localStorage.setItem('user', JSON.stringify(user));
      this.accountService.loadCurrentUser();
    } catch {
      // ignore
    }
  }
}
