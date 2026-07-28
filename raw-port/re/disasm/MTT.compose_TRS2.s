__ZN26MaterialTextureTransformer23composeTextureTransformERK9PCVector2IdEdS3_:
00000000004af0e0	pushq	%rbp
00000000004af0e1	movq	%rsp, %rbp
00000000004af0e4	pushq	%r14
00000000004af0e6	pushq	%rbx
00000000004af0e7	movq	%rdx, %r14
00000000004af0ea	movq	%rdi, %rbx
00000000004af0ed	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000004af0f7	movq	%rax, 0x78(%rdi)
00000000004af0fb	movq	%rax, 0x50(%rdi)
00000000004af0ff	movq	%rax, 0x28(%rdi)
00000000004af103	movq	%rax, (%rdi)
00000000004af106	xorps	%xmm1, %xmm1
00000000004af109	movups	%xmm1, 0x8(%rdi)
00000000004af10d	movups	%xmm1, 0x18(%rdi)
00000000004af111	movups	%xmm1, 0x30(%rdi)
00000000004af115	movups	%xmm1, 0x40(%rdi)
00000000004af119	movups	%xmm1, 0x58(%rdi)
00000000004af11d	movups	%xmm1, 0x68(%rdi)
00000000004af121	movsd	(%rsi), %xmm3
00000000004af125	movsd	0x8(%rsi), %xmm1
00000000004af12a	xorpd	%xmm2, %xmm2
00000000004af12e	ucomisd	%xmm2, %xmm3
00000000004af132	jne	0x4af136
00000000004af134	jnp	0x4af160
00000000004af136	xorpd	%xmm4, %xmm4
00000000004af13a	subsd	%xmm3, %xmm4
00000000004af13e	mulsd	%xmm2, %xmm3
00000000004af142	movddup	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0]
00000000004af146	movsd	0x256292(%rip), %xmm5
00000000004af14e	subpd	%xmm3, %xmm5
00000000004af152	movupd	%xmm5, (%rbx)
00000000004af156	movhpd	%xmm5, 0x10(%rbx)
00000000004af15b	movsd	%xmm4, 0x18(%rbx)
00000000004af160	ucomisd	%xmm2, %xmm1
00000000004af164	jne	0x4af168
00000000004af166	jnp	0x4af197
00000000004af168	movapd	%xmm1, %xmm3
00000000004af16c	mulsd	%xmm2, %xmm3
00000000004af170	movddup	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0]
00000000004af174	xorpd	%xmm4, %xmm4
00000000004af178	movhpd	0x256260(%rip), %xmm4           ## xmm4 = xmm4[0],mem[0]
00000000004af180	subpd	%xmm3, %xmm4
00000000004af184	movupd	%xmm4, 0x20(%rbx)
00000000004af189	movlpd	%xmm4, 0x30(%rbx)
00000000004af18e	subsd	%xmm1, %xmm2
00000000004af192	movsd	%xmm2, 0x38(%rbx)
00000000004af197	xorps	0x2583c2(%rip), %xmm0
00000000004af19e	movq	%rbx, %rdi
00000000004af1a1	movl	$0x2, %esi
00000000004af1a6	callq	__ZN14PCMatrix44TmplIdE10leftRotateEdNS0_4axisE ## PCMatrix44Tmpl<double>::leftRotate(double, PCMatrix44Tmpl<double>::axis)
00000000004af1ab	movsd	0x25622d(%rip), %xmm0
00000000004af1b3	movapd	%xmm0, %xmm1
00000000004af1b7	divsd	(%r14), %xmm1
00000000004af1bc	ucomisd	%xmm0, %xmm1
00000000004af1c0	divsd	0x8(%r14), %xmm0
00000000004af1c6	jne	0x4af1ca
00000000004af1c8	jnp	0x4af1e8
00000000004af1ca	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000004af1ce	movupd	(%rbx), %xmm2
00000000004af1d2	movupd	0x10(%rbx), %xmm3
00000000004af1d7	mulpd	%xmm1, %xmm2
00000000004af1db	movupd	%xmm2, (%rbx)
00000000004af1df	mulpd	%xmm1, %xmm3
00000000004af1e3	movupd	%xmm3, 0x10(%rbx)
00000000004af1e8	ucomisd	0x2561f0(%rip), %xmm0
00000000004af1f0	jne	0x4af1f4
00000000004af1f2	jnp	0x4af214
00000000004af1f4	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000004af1f8	movupd	0x20(%rbx), %xmm1
00000000004af1fd	movupd	0x30(%rbx), %xmm2
00000000004af202	mulpd	%xmm0, %xmm1
00000000004af206	movupd	%xmm1, 0x20(%rbx)
00000000004af20b	mulpd	%xmm0, %xmm2
00000000004af20f	movupd	%xmm2, 0x30(%rbx)
00000000004af214	movq	%rbx, %rax
00000000004af217	popq	%rbx
00000000004af218	popq	%r14
00000000004af21a	popq	%rbp
00000000004af21b	retq
00000000004af21c	nopl	(%rax)