Rails.application.routes.draw do
  # Devise routes
  devise_for :users

  # Dashboard (requires login)
  resource :dashboard, only: [:show], controller: "dashboard"

  # Profile
  resource :profile, only: [:show, :edit, :update]

  # Admin namespace (future)
  # namespace :admin do
  #   resources :users, only: [:index, :show, :edit, :update, :destroy]
  # end

  # Teacher namespace (future)
  # namespace :teacher do
  #   resources :students, only: [:index, :show]
  # end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Root path
  root "home#index"
end
