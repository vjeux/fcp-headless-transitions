__ZNK19OZChannelRotation3D15getValueAsQuatdER6PCQuatIdERK6CMTimed:
0000000000082062	pushq	%rbp
0000000000082063	movq	%rsp, %rbp
0000000000082066	pushq	%r15
0000000000082068	pushq	%r14
000000000008206a	pushq	%rbx
000000000008206b	subq	$0x38, %rsp
000000000008206f	movsd	%xmm0, -0x20(%rbp)
0000000000082074	movq	%rdx, %r14
0000000000082077	movq	%rsi, %rbx
000000000008207a	movq	%rdi, %r15
000000000008207d	addq	$0x88, %rdi
0000000000082084	movq	%rdx, %rsi
0000000000082087	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000008208c	movsd	%xmm0, -0x30(%rbp)
0000000000082091	leaq	0x120(%r15), %rdi
0000000000082098	movq	%r14, %rsi
000000000008209b	movsd	-0x20(%rbp), %xmm0
00000000000820a0	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000820a5	movsd	%xmm0, -0x28(%rbp)
00000000000820aa	addq	$0x1b8, %r15                    ## imm = 0x1B8
00000000000820b1	movq	%r15, %rdi
00000000000820b4	movq	%r14, %rsi
00000000000820b7	movsd	-0x20(%rbp), %xmm0
00000000000820bc	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000820c1	movsd	%xmm0, -0x50(%rbp)
00000000000820c6	movsd	-0x30(%rbp), %xmm0
00000000000820cb	mulsd	0x2e2ed(%rip), %xmm0
00000000000820d3	callq	0xacea6                         ## symbol stub for: ___sincos_stret
00000000000820d8	movsd	%xmm0, -0x48(%rbp)
00000000000820dd	movsd	%xmm1, -0x30(%rbp)
00000000000820e2	xorpd	%xmm1, %xmm1
00000000000820e6	movapd	%xmm0, %xmm2
00000000000820ea	mulsd	%xmm1, %xmm2
00000000000820ee	movsd	%xmm2, -0x20(%rbp)
00000000000820f3	movsd	-0x28(%rbp), %xmm0
00000000000820f8	mulsd	0x2e2c0(%rip), %xmm0
0000000000082100	callq	0xacea6                         ## symbol stub for: ___sincos_stret
0000000000082105	movsd	%xmm0, -0x28(%rbp)
000000000008210a	movsd	%xmm1, -0x40(%rbp)
000000000008210f	xorpd	%xmm1, %xmm1
0000000000082113	mulsd	%xmm1, %xmm0
0000000000082117	movsd	%xmm0, -0x38(%rbp)
000000000008211c	movsd	-0x50(%rbp), %xmm0
0000000000082121	mulsd	0x2e297(%rip), %xmm0
0000000000082129	callq	0xacea6                         ## symbol stub for: ___sincos_stret
000000000008212e	xorpd	%xmm13, %xmm13
0000000000082133	mulsd	%xmm0, %xmm13
0000000000082138	movsd	-0x30(%rbp), %xmm8
000000000008213e	movapd	%xmm8, %xmm5
0000000000082143	movsd	-0x40(%rbp), %xmm12
0000000000082149	mulsd	%xmm12, %xmm5
000000000008214e	movsd	-0x48(%rbp), %xmm7
0000000000082153	movapd	%xmm7, %xmm2
0000000000082157	movsd	-0x38(%rbp), %xmm9
000000000008215d	mulsd	%xmm9, %xmm2
0000000000082162	movsd	-0x20(%rbp), %xmm10
0000000000082168	movapd	%xmm10, %xmm4
000000000008216d	movsd	-0x28(%rbp), %xmm11
0000000000082173	mulsd	%xmm11, %xmm4
0000000000082178	movapd	%xmm4, %xmm6
000000000008217c	addsd	%xmm2, %xmm6
0000000000082180	movapd	%xmm10, %xmm3
0000000000082185	mulsd	%xmm9, %xmm3
000000000008218a	addsd	%xmm3, %xmm6
000000000008218e	subsd	%xmm6, %xmm5
0000000000082192	movapd	%xmm7, %xmm6
0000000000082196	mulsd	%xmm12, %xmm6
000000000008219b	mulsd	%xmm12, %xmm10
00000000000821a0	mulsd	%xmm8, %xmm9
00000000000821a5	mulsd	%xmm11, %xmm8
00000000000821aa	addsd	%xmm9, %xmm6
00000000000821af	addsd	%xmm10, %xmm8
00000000000821b4	addsd	%xmm10, %xmm9
00000000000821b9	subsd	%xmm3, %xmm4
00000000000821bd	addsd	%xmm6, %xmm4
00000000000821c1	subsd	%xmm3, %xmm2
00000000000821c5	addsd	%xmm8, %xmm2
00000000000821ca	movapd	%xmm7, %xmm6
00000000000821ce	mulsd	%xmm11, %xmm6
00000000000821d3	subsd	%xmm6, %xmm3
00000000000821d7	addsd	%xmm9, %xmm3
00000000000821dc	movapd	%xmm1, %xmm6
00000000000821e0	mulsd	%xmm5, %xmm6
00000000000821e4	movapd	%xmm13, %xmm7
00000000000821e9	mulsd	%xmm4, %xmm7
00000000000821ed	movapd	%xmm13, %xmm8
00000000000821f2	mulsd	%xmm2, %xmm8
00000000000821f7	movapd	%xmm7, %xmm9
00000000000821fc	addsd	%xmm8, %xmm9
0000000000082201	movapd	%xmm13, %xmm11
0000000000082206	mulsd	%xmm5, %xmm11
000000000008220b	mulsd	%xmm0, %xmm5
000000000008220f	movapd	%xmm1, %xmm12
0000000000082214	mulsd	%xmm4, %xmm12
0000000000082219	movapd	%xmm1, %xmm10
000000000008221e	mulsd	%xmm2, %xmm10
0000000000082223	mulsd	%xmm0, %xmm2
0000000000082227	mulsd	%xmm0, %xmm4
000000000008222b	mulsd	%xmm3, %xmm0
000000000008222f	addsd	%xmm9, %xmm0
0000000000082234	subsd	%xmm0, %xmm6
0000000000082238	mulsd	%xmm3, %xmm1
000000000008223c	addsd	%xmm5, %xmm1
0000000000082240	addsd	%xmm11, %xmm12
0000000000082245	addsd	%xmm11, %xmm10
000000000008224a	mulsd	%xmm13, %xmm3
000000000008224f	subsd	%xmm3, %xmm2
0000000000082253	addsd	%xmm12, %xmm2
0000000000082258	subsd	%xmm4, %xmm3
000000000008225c	addsd	%xmm10, %xmm3
0000000000082261	subsd	%xmm8, %xmm7
0000000000082266	addsd	%xmm1, %xmm7
000000000008226a	movsd	%xmm2, 0x8(%rbx)
000000000008226f	movsd	%xmm3, 0x10(%rbx)
0000000000082274	movsd	%xmm7, 0x18(%rbx)
0000000000082279	movsd	%xmm6, (%rbx)
000000000008227d	addq	$0x38, %rsp
0000000000082281	popq	%rbx
0000000000082282	popq	%r14
0000000000082284	popq	%r15
0000000000082286	popq	%rbp
0000000000082287	retq
