import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Plus, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import useGlobalReducer from '../hooks/useGlobalReducer'
import api from '../services/api'
import SharePostModal from '../components/SharePostModal'

export default function Community() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const res = await api.get('/community/feed')
      dispatch({ type: 'set_community_posts', payload: res.data.posts })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/community/post/${postId}/like`)
      dispatch({ type: 'like_post', payload: { postId, likes: res.data.likes, liked: res.data.liked } })
    } catch (err) {
      toast.error('Could not like post')
    }
  }

  const posts = store.communityPosts || []

  // Gradients for posts without photo
  const gradients = [
    'linear-gradient(135deg, #b8d4a8, #8ab888)',
    'linear-gradient(135deg, #e8c8e8, #c090c0)',
    'linear-gradient(135deg, #d4c8a8, #b8a880)',
    'linear-gradient(135deg, #a8d4d4, #80b8b8)',
  ]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#1a2e0a' }}>
          Plant Community 🌍
        </p>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: 12 }}
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} /> Share
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <div className="animate-pulse" style={{ fontSize: 32 }}>🌿</div>
          <p style={{ fontSize: 12, color: '#6a8a5a', marginTop: 10 }}>Loading community posts...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1a2e0a', marginBottom: 4 }}>
            No posts yet
          </p>
          <p style={{ fontSize: 12, color: '#6a8a5a', marginBottom: 16 }}>
            Be the first to share something
          </p>
          <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Share your plant
          </button>
        </div>
      )}

      {/* Feed grid */}
      {!loading && posts.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12
        }}>
          {posts.map((post, i) => (
            <div key={post.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>

              {/* Hero photo */}
              <div style={{
                height: 140,
                background: post.photo_url ? 'none' : gradients[i % gradients.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', fontSize: 52
              }}>
                {post.photo_url
                  ? <img src={post.photo_url} alt={post.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🌿'
                }
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(26,46,10,.65))' }} />
                <p
                  style={{
                    position: 'absolute', bottom: 8, left: 12,
                    fontSize: 11, fontWeight: 700, color: 'white'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/profile/${post.author_username}`)
                  }}
                >
                  @{post.author_username}
                </p>
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px' }}>
                {post.plant_name && (
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#2d5a1b', marginBottom: 2 }}>
                    {post.plant_name}
                  </p>
                )}
                <p style={{ fontSize: 12, color: '#1a2e0a', lineHeight: 1.4, marginBottom: 8 }}>
                  {post.caption}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(post.id)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 11, color: post.user_liked ? '#e04040' : '#6a8a5a',
                      background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    <Heart size={13} fill={post.user_liked ? '#e04040' : 'none'} />
                    {post.likes_count || 0}
                  </button>
                  <p style={{ fontSize: 10, color: '#8aaa7a' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <SharePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

    </div>
  )
}
