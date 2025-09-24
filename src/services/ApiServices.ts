// API Services for admin functionality
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Admin service
export const adminService = {
  async getUsers(): Promise<ApiResponse> {
    // Mock implementation - replace with actual API calls
    return {
      success: true,
      data: [],
      message: "Users fetched successfully"
    };
  },

  async getAllUsers(): Promise<ApiResponse> {
    return this.getUsers();
  },

  async updateAdminProfile(data: any): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      data: data,
      message: "Profile updated successfully"
    };
  },

  async changePassword(data: any): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      message: "Password changed successfully"
    };
  },

  async changeAdminPassword(data: any): Promise<ApiResponse> {
    return this.changePassword(data);
  },

  async updateAdminAvatar(formData: FormData): Promise<ApiResponse> {
    // Mock implementation
    const file = formData.get('avatar') as File;
    if (file) {
      return {
        success: true,
        data: { avatar: URL.createObjectURL(file) },
        message: "Avatar updated successfully"
      };
    }
    return {
      success: false,
      message: "No file provided"
    };
  },

  async uploadCSV(formData: FormData): Promise<ApiResponse> {
    // Mock implementation
    const file = formData.get('csvFile') as File;
    if (file) {
      return {
        success: true,
        data: { processed: 0 },
        message: "CSV uploaded successfully"
      };
    }
    return {
      success: false,
      message: "No file provided"
    };
  },

  async editUserDetails(id: string, data: any): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      data: { _id: id, ...data },
      message: "User updated successfully"
    };
  },

  async deleteUser(id: string): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      message: "User deleted successfully"
    };
  }
};

// Event service
export const eventService = {
  async getEvents(): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      data: [],
      message: "Events fetched successfully"
    };
  },

  async createEvent(data: any): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      data: { _id: Date.now().toString(), ...data },
      message: "Event created successfully"
    };
  },

  async deleteEvent(id: string): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      message: "Event deleted successfully"
    };
  }
};

// Donation service
export const donationService = {
  async getDonations(): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      data: [],
      message: "Donations fetched successfully"
    };
  },

  async getCampaigns(): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      data: [],
      message: "Campaigns fetched successfully"
    };
  },

  async createCampaign(data: any): Promise<ApiResponse> {
    // Mock implementation
    return {
      success: true,
      data: { _id: Date.now().toString(), ...data },
      message: "Campaign created successfully"
    };
  }
};

// Error handling utilities
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.message || "API Error",
      status: error.response.status,
      code: error.response.data?.code
    };
  }
  
  return {
    message: error.message || "Network Error"
  };
};

export const handleApiSuccess = (response: ApiResponse) => {
  return {
    message: response.message || "Operation successful",
    data: response.data
  };
};