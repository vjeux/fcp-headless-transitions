__ZN23OZChannelSegmentVisitor11mapPingPongERK6CMTimeS2_S2_S2_bRb:
00000000000a3d9c	pushq	%rbp
00000000000a3d9d	movq	%rsp, %rbp
00000000000a3da0	pushq	%r15
00000000000a3da2	pushq	%r14
00000000000a3da4	pushq	%r13
00000000000a3da6	pushq	%r12
00000000000a3da8	pushq	%rbx
00000000000a3da9	subq	$0xf8, %rsp
00000000000a3db0	movl	%r9d, -0x68(%rbp)
00000000000a3db4	movq	%r8, -0xa0(%rbp)
00000000000a3dbb	movq	%rcx, %r13
00000000000a3dbe	movq	%rdx, %r14
00000000000a3dc1	movq	%rsi, %rbx
00000000000a3dc4	movq	%rdi, %r12
00000000000a3dc7	movq	0x10(%rcx), %rax
00000000000a3dcb	movq	%rax, -0x30(%rbp)
00000000000a3dcf	movups	(%rcx), %xmm0
00000000000a3dd2	movaps	%xmm0, -0x40(%rbp)
00000000000a3dd6	movq	0x10(%rdx), %rax
00000000000a3dda	movq	%rax, -0x50(%rbp)
00000000000a3dde	movups	(%rdx), %xmm0
00000000000a3de1	movaps	%xmm0, -0x60(%rbp)
00000000000a3de5	movq	-0x50(%rbp), %rax
00000000000a3de9	movq	%rax, 0x28(%rsp)
00000000000a3dee	movaps	-0x60(%rbp), %xmm0
00000000000a3df2	movups	%xmm0, 0x18(%rsp)
00000000000a3df7	movq	-0x30(%rbp), %rax
00000000000a3dfb	movq	%rax, 0x10(%rsp)
00000000000a3e00	movaps	-0x40(%rbp), %xmm0
00000000000a3e04	movups	%xmm0, (%rsp)
00000000000a3e08	leaq	-0x98(%rbp), %r15
00000000000a3e0f	movq	%r15, %rdi
00000000000a3e12	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a3e17	movq	0x266a2(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000a3e1e	movq	0x10(%rcx), %rax
00000000000a3e22	movq	%rax, -0x30(%rbp)
00000000000a3e26	movups	(%rcx), %xmm0
00000000000a3e29	movaps	%xmm0, -0x40(%rbp)
00000000000a3e2d	movq	-0x30(%rbp), %rax
00000000000a3e31	movq	%rax, 0x28(%rsp)
00000000000a3e36	movaps	-0x40(%rbp), %xmm0
00000000000a3e3a	movups	%xmm0, 0x18(%rsp)
00000000000a3e3f	movq	0x10(%r15), %rax
00000000000a3e43	movq	%rax, 0x10(%rsp)
00000000000a3e48	movups	(%r15), %xmm0
00000000000a3e4c	movups	%xmm0, (%rsp)
00000000000a3e50	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a3e55	testl	%eax, %eax
00000000000a3e57	je	0xa4142
00000000000a3e5d	movq	0x10(%rbx), %rax
00000000000a3e61	movq	%rax, -0x30(%rbp)
00000000000a3e65	movups	(%rbx), %xmm0
00000000000a3e68	movaps	%xmm0, -0x40(%rbp)
00000000000a3e6c	movq	0x10(%r14), %rax
00000000000a3e70	movq	%rax, -0x50(%rbp)
00000000000a3e74	movups	(%r14), %xmm0
00000000000a3e78	movaps	%xmm0, -0x60(%rbp)
00000000000a3e7c	movq	-0x50(%rbp), %rax
00000000000a3e80	movq	%rax, 0x28(%rsp)
00000000000a3e85	movaps	-0x60(%rbp), %xmm0
00000000000a3e89	movups	%xmm0, 0x18(%rsp)
00000000000a3e8e	movq	-0x30(%rbp), %rax
00000000000a3e92	movq	%rax, 0x10(%rsp)
00000000000a3e97	movaps	-0x40(%rbp), %xmm0
00000000000a3e9b	movups	%xmm0, (%rsp)
00000000000a3e9f	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a3ea4	testl	%eax, %eax
00000000000a3ea6	js	0xa414e
00000000000a3eac	movq	0x10(%rbx), %rax
00000000000a3eb0	movq	%rax, -0x30(%rbp)
00000000000a3eb4	movups	(%rbx), %xmm0
00000000000a3eb7	movaps	%xmm0, -0x40(%rbp)
00000000000a3ebb	movq	0x10(%r13), %rax
00000000000a3ebf	movq	%rax, -0x50(%rbp)
00000000000a3ec3	movups	(%r13), %xmm0
00000000000a3ec8	movaps	%xmm0, -0x60(%rbp)
00000000000a3ecc	movq	-0x50(%rbp), %rax
00000000000a3ed0	movq	%rax, 0x28(%rsp)
00000000000a3ed5	movaps	-0x60(%rbp), %xmm0
00000000000a3ed9	movups	%xmm0, 0x18(%rsp)
00000000000a3ede	movq	-0x30(%rbp), %rax
00000000000a3ee2	movq	%rax, 0x10(%rsp)
00000000000a3ee7	movaps	-0x40(%rbp), %xmm0
00000000000a3eeb	movups	%xmm0, (%rsp)
00000000000a3eef	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a3ef4	testl	%eax, %eax
00000000000a3ef6	js	0xa45a0
00000000000a3efc	cmpb	$0x0, -0x68(%rbp)
00000000000a3f00	movq	-0xa0(%rbp), %r15
00000000000a3f07	je	0xa43bf
00000000000a3f0d	movq	0x10(%r15), %rax
00000000000a3f11	movq	%rax, -0x30(%rbp)
00000000000a3f15	movups	(%r15), %xmm0
00000000000a3f19	movaps	%xmm0, -0x40(%rbp)
00000000000a3f1d	movq	-0x30(%rbp), %rax
00000000000a3f21	movq	%rax, 0x28(%rsp)
00000000000a3f26	movaps	-0x40(%rbp), %xmm0
00000000000a3f2a	movups	%xmm0, 0x18(%rsp)
00000000000a3f2f	movq	-0x88(%rbp), %rax
00000000000a3f36	movq	%rax, 0x10(%rsp)
00000000000a3f3b	movups	-0x98(%rbp), %xmm0
00000000000a3f42	movups	%xmm0, (%rsp)
00000000000a3f46	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a3f4b	testl	%eax, %eax
00000000000a3f4d	js	0xa43bf
00000000000a3f53	movq	0x10(%r15), %rax
00000000000a3f57	movq	%rax, -0x30(%rbp)
00000000000a3f5b	movups	(%r15), %xmm0
00000000000a3f5f	movaps	%xmm0, -0x40(%rbp)
00000000000a3f63	movq	-0x30(%rbp), %rax
00000000000a3f67	movq	%rax, 0x28(%rsp)
00000000000a3f6c	movaps	-0x40(%rbp), %xmm0
00000000000a3f70	movups	%xmm0, 0x18(%rsp)
00000000000a3f75	movq	-0x88(%rbp), %rax
00000000000a3f7c	movq	%rax, 0x10(%rsp)
00000000000a3f81	movups	-0x98(%rbp), %xmm0
00000000000a3f88	movups	%xmm0, (%rsp)
00000000000a3f8c	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a3f91	testl	%eax, %eax
00000000000a3f93	je	0xa4643
00000000000a3f99	movq	%r14, -0x68(%rbp)
00000000000a3f9d	movq	0x10(%rbx), %rax
00000000000a3fa1	movq	%r15, %rcx
00000000000a3fa4	leaq	-0x40(%rbp), %r15
00000000000a3fa8	movq	%rax, 0x10(%r15)
00000000000a3fac	movups	(%rbx), %xmm0
00000000000a3faf	movaps	%xmm0, (%r15)
00000000000a3fb3	movq	0x10(%r13), %rax
00000000000a3fb7	leaq	-0x60(%rbp), %r14
00000000000a3fbb	movq	%rax, 0x10(%r14)
00000000000a3fbf	movups	(%r13), %xmm0
00000000000a3fc4	movq	%rcx, %r13
00000000000a3fc7	movaps	%xmm0, (%r14)
00000000000a3fcb	movq	0x10(%r14), %rax
00000000000a3fcf	movq	%rax, 0x28(%rsp)
00000000000a3fd4	movaps	(%r14), %xmm0
00000000000a3fd8	movups	%xmm0, 0x18(%rsp)
00000000000a3fdd	movq	0x10(%r15), %rax
00000000000a3fe1	movq	%rax, 0x10(%rsp)
00000000000a3fe6	movaps	(%r15), %xmm0
00000000000a3fea	movups	%xmm0, (%rsp)
00000000000a3fee	movq	%r12, %rbx
00000000000a3ff1	movq	%r12, %rdi
00000000000a3ff4	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a3ff9	movq	0x10(%r13), %rax
00000000000a3ffd	movq	%rax, 0x10(%r15)
00000000000a4001	movups	(%r13), %xmm0
00000000000a4006	movaps	%xmm0, (%r15)
00000000000a400a	movq	0x10(%r15), %rax
00000000000a400e	movq	%rax, 0x28(%rsp)
00000000000a4013	movaps	(%r15), %xmm0
00000000000a4017	movups	%xmm0, 0x18(%rsp)
00000000000a401c	movq	-0x88(%rbp), %rax
00000000000a4023	movq	%rax, 0x10(%rsp)
00000000000a4028	movups	-0x98(%rbp), %xmm0
00000000000a402f	movups	%xmm0, (%rsp)
00000000000a4033	movq	%r14, %rdi
00000000000a4036	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a403b	leaq	-0x80(%rbp), %r12
00000000000a403f	movq	%r12, %rdi
00000000000a4042	movq	%r14, %rsi
00000000000a4045	movl	$0x2, %edx
00000000000a404a	callq	0xace2e                         ## symbol stub for: __ZmlRK6CMTimei
00000000000a404f	movq	%r15, %rdi
00000000000a4052	movq	%rbx, %rsi
00000000000a4055	movq	%r12, %rdx
00000000000a4058	callq	__ZN6PCMath3modERK6CMTimeS2_    ## PCMath::mod(CMTime const&, CMTime const&)
00000000000a405d	movq	0x10(%r15), %rax
00000000000a4061	movq	%rax, 0x10(%rbx)
00000000000a4065	movups	(%r15), %xmm0
00000000000a4069	movups	%xmm0, (%rbx)
00000000000a406c	movq	0x10(%rbx), %rax
00000000000a4070	movq	%rax, 0x10(%r15)
00000000000a4074	movups	(%rbx), %xmm0
00000000000a4077	movaps	%xmm0, (%r15)
00000000000a407b	movq	0x10(%r14), %rax
00000000000a407f	movq	%rax, 0x28(%rsp)
00000000000a4084	movups	(%r14), %xmm0
00000000000a4088	movups	%xmm0, 0x18(%rsp)
00000000000a408d	movq	0x10(%r15), %rax
00000000000a4091	movq	%rax, 0x10(%rsp)
00000000000a4096	movaps	(%r15), %xmm0
00000000000a409a	movups	%xmm0, (%rsp)
00000000000a409e	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a40a3	testl	%eax, %eax
00000000000a40a5	js	0xa4664
00000000000a40ab	movq	0x10(%rbx), %rax
00000000000a40af	movq	%rax, -0x30(%rbp)
00000000000a40b3	movups	(%rbx), %xmm0
00000000000a40b6	movaps	%xmm0, -0x40(%rbp)
00000000000a40ba	movq	-0x50(%rbp), %rax
00000000000a40be	movq	%rax, 0x28(%rsp)
00000000000a40c3	movups	-0x60(%rbp), %xmm0
00000000000a40c7	movups	%xmm0, 0x18(%rsp)
00000000000a40cc	movq	-0x30(%rbp), %rax
00000000000a40d0	movq	%rax, 0x10(%rsp)
00000000000a40d5	movaps	-0x40(%rbp), %xmm0
00000000000a40d9	movups	%xmm0, (%rsp)
00000000000a40dd	leaq	-0xd0(%rbp), %r14
00000000000a40e4	movq	%r14, %rdi
00000000000a40e7	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a40ec	movq	0x10(%r13), %rax
00000000000a40f0	movq	%rax, -0x30(%rbp)
00000000000a40f4	movups	(%r13), %xmm0
00000000000a40f9	movaps	%xmm0, -0x40(%rbp)
00000000000a40fd	movq	-0x30(%rbp), %rax
00000000000a4101	movq	%rax, 0x28(%rsp)
00000000000a4106	movaps	-0x40(%rbp), %xmm0
00000000000a410a	movups	%xmm0, 0x18(%rsp)
00000000000a410f	movq	0x10(%r14), %rax
00000000000a4113	movq	%rax, 0x10(%rsp)
00000000000a4118	movups	(%r14), %xmm0
00000000000a411c	movups	%xmm0, (%rsp)
00000000000a4120	leaq	-0x80(%rbp), %r14
00000000000a4124	movq	%r14, %rdi
00000000000a4127	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000a412c	movq	0x10(%r14), %rax
00000000000a4130	movq	%rax, 0x10(%rbx)
00000000000a4134	movups	(%r14), %xmm0
00000000000a4138	movups	%xmm0, (%rbx)
00000000000a413b	xorl	%eax, %eax
00000000000a413d	jmp	0xa46b3
00000000000a4142	movq	0x10(%rbp), %rax
00000000000a4146	movb	$0x0, (%rax)
00000000000a4149	jmp	0xa461c
00000000000a414e	movq	0x10(%r14), %rax
00000000000a4152	leaq	-0x40(%rbp), %r15
00000000000a4156	movq	%rax, 0x10(%r15)
00000000000a415a	movq	%r14, -0x68(%rbp)
00000000000a415e	movups	(%r14), %xmm0
00000000000a4162	movaps	%xmm0, (%r15)
00000000000a4166	movq	0x10(%rbx), %rax
00000000000a416a	leaq	-0x60(%rbp), %r13
00000000000a416e	movq	%rax, 0x10(%r13)
00000000000a4172	movups	(%rbx), %xmm0
00000000000a4175	movaps	%xmm0, (%r13)
00000000000a417a	movq	0x10(%r13), %rax
00000000000a417e	movq	%rax, 0x28(%rsp)
00000000000a4183	movaps	(%r13), %xmm0
00000000000a4188	movups	%xmm0, 0x18(%rsp)
00000000000a418d	movq	0x10(%r15), %rax
00000000000a4191	movq	%rax, 0x10(%rsp)
00000000000a4196	movaps	(%r15), %xmm0
00000000000a419a	movups	%xmm0, (%rsp)
00000000000a419e	movq	%r12, %rbx
00000000000a41a1	movq	%r12, %rdi
00000000000a41a4	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a41a9	leaq	-0xb8(%rbp), %r14
00000000000a41b0	leaq	-0x98(%rbp), %rsi
00000000000a41b7	movsd	0xc431(%rip), %xmm0
00000000000a41bf	movq	%r14, %rdi
00000000000a41c2	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
00000000000a41c7	leaq	-0xf0(%rbp), %r12
00000000000a41ce	movq	%r12, %rdi
00000000000a41d1	movq	%rbx, %rsi
00000000000a41d4	movq	%r14, %rdx
00000000000a41d7	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
00000000000a41dc	leaq	-0xd0(%rbp), %r14
00000000000a41e3	movl	$0x1, %esi
00000000000a41e8	movq	%r14, %rdi
00000000000a41eb	movl	$0x1, %edx
00000000000a41f0	callq	0xaca92                         ## symbol stub for: _CMTimeMake
00000000000a41f5	movq	0x10(%r14), %rax
00000000000a41f9	movq	%rax, 0x28(%rsp)
00000000000a41fe	movups	(%r14), %xmm0
00000000000a4202	movups	%xmm0, 0x18(%rsp)
00000000000a4207	movq	0x10(%r12), %rax
00000000000a420c	movq	%rax, 0x10(%rsp)
00000000000a4211	movaps	(%r12), %xmm0
00000000000a4216	movups	%xmm0, (%rsp)
00000000000a421a	leaq	-0x80(%rbp), %r14
00000000000a421e	movq	%r14, %rdi
00000000000a4221	callq	0xacace                         ## symbol stub for: _PC_CMTimeFloorToSampleDuration
00000000000a4226	movq	0x10(%r14), %rax
00000000000a422a	movq	%rax, 0x28(%rsp)
00000000000a422f	movups	(%r14), %xmm0
00000000000a4233	movups	%xmm0, 0x18(%rsp)
00000000000a4238	movq	0x10(%r12), %rax
00000000000a423d	movq	%rax, 0x10(%rsp)
00000000000a4242	movaps	(%r12), %xmm0
00000000000a4247	movups	%xmm0, (%rsp)
00000000000a424b	movq	%r13, %rdi
00000000000a424e	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4253	movq	%r15, %rdi
00000000000a4256	movq	%r13, %rsi
00000000000a4259	leaq	-0xb8(%rbp), %rdx
00000000000a4260	callq	0xace22                         ## symbol stub for: __ZmlRK6CMTimeS1_
00000000000a4265	movq	0x10(%r15), %rax
00000000000a4269	movq	%rax, 0x10(%r12)
00000000000a426e	movups	(%r15), %xmm0
00000000000a4272	movaps	%xmm0, (%r12)
00000000000a4277	movq	%rbx, %r12
00000000000a427a	movq	%rax, 0x10(%rbx)
00000000000a427e	movups	%xmm0, (%rbx)
00000000000a4281	movq	0x10(%rbx), %rax
00000000000a4285	movq	%rax, 0x10(%r15)
00000000000a4289	movups	(%rbx), %xmm0
00000000000a428c	movaps	%xmm0, (%r15)
00000000000a4290	movq	0x26229(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000a4297	movq	0x10(%rcx), %rax
00000000000a429b	movq	%rax, 0x10(%r13)
00000000000a429f	movups	(%rcx), %xmm0
00000000000a42a2	movaps	%xmm0, (%r13)
00000000000a42a7	movq	0x10(%r13), %rax
00000000000a42ab	movq	%rax, 0x28(%rsp)
00000000000a42b0	movaps	(%r13), %xmm0
00000000000a42b5	movups	%xmm0, 0x18(%rsp)
00000000000a42ba	movq	0x10(%r15), %rax
00000000000a42be	movq	%rax, 0x10(%rsp)
00000000000a42c3	movaps	(%r15), %xmm0
00000000000a42c7	movups	%xmm0, (%rsp)
00000000000a42cb	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a42d0	testl	%eax, %eax
00000000000a42d2	jne	0xa4301
00000000000a42d4	leaq	-0x40(%rbp), %r14
00000000000a42d8	leaq	-0x98(%rbp), %rsi
00000000000a42df	movsd	0xc309(%rip), %xmm0
00000000000a42e7	movq	%r14, %rdi
00000000000a42ea	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
00000000000a42ef	movq	0x10(%r14), %rax
00000000000a42f3	movq	%rax, 0x10(%r12)
00000000000a42f8	movups	(%r14), %xmm0
00000000000a42fc	movups	%xmm0, (%r12)
00000000000a4301	movq	0x10(%r12), %rax
00000000000a4306	movq	%rax, -0x30(%rbp)
00000000000a430a	movups	(%r12), %xmm0
00000000000a430f	movaps	%xmm0, -0x40(%rbp)
00000000000a4313	movq	-0x88(%rbp), %rax
00000000000a431a	movq	%rax, 0x28(%rsp)
00000000000a431f	movups	-0x98(%rbp), %xmm0
00000000000a4326	movups	%xmm0, 0x18(%rsp)
00000000000a432b	movq	-0x30(%rbp), %rax
00000000000a432f	movq	%rax, 0x10(%rsp)
00000000000a4334	movaps	-0x40(%rbp), %xmm0
00000000000a4338	movups	%xmm0, (%rsp)
00000000000a433c	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a4341	testl	%eax, %eax
00000000000a4343	movq	0x10(%rbp), %rbx
00000000000a4347	jle	0xa45ba
00000000000a434d	leaq	-0x80(%rbp), %r14
00000000000a4351	leaq	-0x98(%rbp), %rsi
00000000000a4358	movq	%r14, %rdi
00000000000a435b	movl	$0x2, %edx
00000000000a4360	callq	0xace2e                         ## symbol stub for: __ZmlRK6CMTimei
00000000000a4365	movq	0x10(%r12), %rax
00000000000a436a	movq	%rax, -0x30(%rbp)
00000000000a436e	movups	(%r12), %xmm0
00000000000a4373	movaps	%xmm0, -0x40(%rbp)
00000000000a4377	movq	-0x30(%rbp), %rax
00000000000a437b	movq	%rax, 0x28(%rsp)
00000000000a4380	movaps	-0x40(%rbp), %xmm0
00000000000a4384	movups	%xmm0, 0x18(%rsp)
00000000000a4389	movq	0x10(%r14), %rax
00000000000a438d	movq	%rax, 0x10(%rsp)
00000000000a4392	movups	(%r14), %xmm0
00000000000a4396	movups	%xmm0, (%rsp)
00000000000a439a	leaq	-0x60(%rbp), %r14
00000000000a439e	movq	%r14, %rdi
00000000000a43a1	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a43a6	movq	0x10(%r14), %rax
00000000000a43aa	movq	%rax, 0x10(%r12)
00000000000a43af	movups	(%r14), %xmm0
00000000000a43b3	movups	%xmm0, (%r12)
00000000000a43b8	xorl	%eax, %eax
00000000000a43ba	jmp	0xa45bc
00000000000a43bf	movq	0x10(%rbx), %rax
00000000000a43c3	leaq	-0x40(%rbp), %r15
00000000000a43c7	movq	%rax, 0x10(%r15)
00000000000a43cb	movups	(%rbx), %xmm0
00000000000a43ce	movaps	%xmm0, (%r15)
00000000000a43d2	movq	0x10(%r14), %rax
00000000000a43d6	leaq	-0x60(%rbp), %rcx
00000000000a43da	movq	%rax, 0x10(%rcx)
00000000000a43de	movq	%r14, -0x68(%rbp)
00000000000a43e2	movups	(%r14), %xmm0
00000000000a43e6	movaps	%xmm0, (%rcx)
00000000000a43e9	movq	0x10(%rcx), %rax
00000000000a43ed	movq	%rax, 0x28(%rsp)
00000000000a43f2	movaps	(%rcx), %xmm0
00000000000a43f5	movups	%xmm0, 0x18(%rsp)
00000000000a43fa	movq	0x10(%r15), %rax
00000000000a43fe	movq	%rax, 0x10(%rsp)
00000000000a4403	movaps	(%r15), %xmm0
00000000000a4407	movups	%xmm0, (%rsp)
00000000000a440b	movq	%r12, %rdi
00000000000a440e	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a4413	leaq	-0xb8(%rbp), %r14
00000000000a441a	leaq	-0x98(%rbp), %rsi
00000000000a4421	movq	%r14, %rdi
00000000000a4424	movl	$0x2, %edx
00000000000a4429	callq	0xace2e                         ## symbol stub for: __ZmlRK6CMTimei
00000000000a442e	leaq	-0xf0(%rbp), %r13
00000000000a4435	movq	%r13, %rdi
00000000000a4438	movq	%r12, %rsi
00000000000a443b	movq	%r14, %rdx
00000000000a443e	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
00000000000a4443	leaq	-0xd0(%rbp), %r14
00000000000a444a	movl	$0x1, %esi
00000000000a444f	movq	%r14, %rdi
00000000000a4452	movl	$0x1, %edx
00000000000a4457	callq	0xaca92                         ## symbol stub for: _CMTimeMake
00000000000a445c	movq	0x10(%r14), %rax
00000000000a4460	movq	%rax, 0x28(%rsp)
00000000000a4465	movups	(%r14), %xmm0
00000000000a4469	movups	%xmm0, 0x18(%rsp)
00000000000a446e	movq	0x10(%r13), %rax
00000000000a4472	movq	%rax, 0x10(%rsp)
00000000000a4477	movaps	(%r13), %xmm0
00000000000a447c	movups	%xmm0, (%rsp)
00000000000a4480	leaq	-0x80(%rbp), %r14
00000000000a4484	movq	%r14, %rdi
00000000000a4487	callq	0xacace                         ## symbol stub for: _PC_CMTimeFloorToSampleDuration
00000000000a448c	movq	0x10(%r14), %rax
00000000000a4490	movq	%rax, 0x28(%rsp)
00000000000a4495	movups	(%r14), %xmm0
00000000000a4499	movups	%xmm0, 0x18(%rsp)
00000000000a449e	movq	0x10(%r13), %rax
00000000000a44a2	movq	%rax, 0x10(%rsp)
00000000000a44a7	movaps	(%r13), %xmm0
00000000000a44ac	movups	%xmm0, (%rsp)
00000000000a44b0	leaq	-0x60(%rbp), %r14
00000000000a44b4	movq	%r14, %rdi
00000000000a44b7	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a44bc	movq	%r15, %rdi
00000000000a44bf	movq	%r14, %rsi
00000000000a44c2	leaq	-0xb8(%rbp), %rdx
00000000000a44c9	callq	0xace22                         ## symbol stub for: __ZmlRK6CMTimeS1_
00000000000a44ce	movq	0x10(%r15), %rax
00000000000a44d2	movq	%rax, 0x10(%r13)
00000000000a44d6	movups	(%r15), %xmm0
00000000000a44da	movaps	%xmm0, (%r13)
00000000000a44df	movq	%rax, 0x10(%r12)
00000000000a44e4	movups	%xmm0, (%r12)
00000000000a44e9	movq	0x10(%r12), %rax
00000000000a44ee	movq	%rax, 0x10(%r15)
00000000000a44f2	movups	(%r12), %xmm0
00000000000a44f7	movaps	%xmm0, (%r15)
00000000000a44fb	leaq	-0x98(%rbp), %rcx
00000000000a4502	movq	0x10(%rcx), %rax
00000000000a4506	movq	%rax, 0x28(%rsp)
00000000000a450b	movups	(%rcx), %xmm0
00000000000a450e	movups	%xmm0, 0x18(%rsp)
00000000000a4513	movq	0x10(%r15), %rax
00000000000a4517	movq	%rax, 0x10(%rsp)
00000000000a451c	movaps	(%r15), %xmm0
00000000000a4520	movups	%xmm0, (%rsp)
00000000000a4524	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000a4529	testl	%eax, %eax
00000000000a452b	js	0xa45c0
00000000000a4531	leaq	-0x80(%rbp), %r14
00000000000a4535	leaq	-0x98(%rbp), %rsi
00000000000a453c	movq	%r14, %rdi
00000000000a453f	movl	$0x2, %edx
00000000000a4544	callq	0xace2e                         ## symbol stub for: __ZmlRK6CMTimei
00000000000a4549	movq	0x10(%r12), %rax
00000000000a454e	movq	%rax, -0x30(%rbp)
00000000000a4552	movups	(%r12), %xmm0
00000000000a4557	movaps	%xmm0, -0x40(%rbp)
00000000000a455b	movq	-0x30(%rbp), %rax
00000000000a455f	movq	%rax, 0x28(%rsp)
00000000000a4564	movaps	-0x40(%rbp), %xmm0
00000000000a4568	movups	%xmm0, 0x18(%rsp)
00000000000a456d	movq	0x10(%r14), %rax
00000000000a4571	movq	%rax, 0x10(%rsp)
00000000000a4576	movups	(%r14), %xmm0
00000000000a457a	movups	%xmm0, (%rsp)
00000000000a457e	leaq	-0x60(%rbp), %r14
00000000000a4582	movq	%r14, %rdi
00000000000a4585	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a458a	movq	0x10(%r14), %rax
00000000000a458e	movq	%rax, 0x10(%r12)
00000000000a4593	movups	(%r14), %xmm0
00000000000a4597	movups	%xmm0, (%r12)
00000000000a459c	movb	$0x1, %al
00000000000a459e	jmp	0xa45c2
00000000000a45a0	movq	0x10(%rbx), %rax
00000000000a45a4	movq	%rax, 0x10(%r12)
00000000000a45a9	movups	(%rbx), %xmm0
00000000000a45ac	movups	%xmm0, (%r12)
00000000000a45b1	movq	0x10(%rbp), %rax
00000000000a45b5	movb	$0x0, (%rax)
00000000000a45b8	jmp	0xa462e
00000000000a45ba	movb	$0x1, %al
00000000000a45bc	movb	%al, (%rbx)
00000000000a45be	jmp	0xa45c8
00000000000a45c0	xorl	%eax, %eax
00000000000a45c2	movq	0x10(%rbp), %rcx
00000000000a45c6	movb	%al, (%rcx)
00000000000a45c8	movq	0x10(%r12), %rax
00000000000a45cd	movq	%rax, -0x50(%rbp)
00000000000a45d1	movups	(%r12), %xmm0
00000000000a45d6	movaps	%xmm0, -0x60(%rbp)
00000000000a45da	movq	-0x68(%rbp), %rcx
00000000000a45de	movq	0x10(%rcx), %rax
00000000000a45e2	movq	%rax, -0x70(%rbp)
00000000000a45e6	movups	(%rcx), %xmm0
00000000000a45e9	movaps	%xmm0, -0x80(%rbp)
00000000000a45ed	movq	-0x70(%rbp), %rax
00000000000a45f1	movq	%rax, 0x28(%rsp)
00000000000a45f6	movaps	-0x80(%rbp), %xmm0
00000000000a45fa	movups	%xmm0, 0x18(%rsp)
00000000000a45ff	movq	-0x50(%rbp), %rax
00000000000a4603	movq	%rax, 0x10(%rsp)
00000000000a4608	movaps	-0x60(%rbp), %xmm0
00000000000a460c	movups	%xmm0, (%rsp)
00000000000a4610	leaq	-0x40(%rbp), %r14
00000000000a4614	movq	%r14, %rdi
00000000000a4617	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000a461c	movq	0x10(%r14), %rax
00000000000a4620	movq	%rax, 0x10(%r12)
00000000000a4625	movups	(%r14), %xmm0
00000000000a4629	movups	%xmm0, (%r12)
00000000000a462e	movq	%r12, %rax
00000000000a4631	addq	$0xf8, %rsp
00000000000a4638	popq	%rbx
00000000000a4639	popq	%r12
00000000000a463b	popq	%r13
00000000000a463d	popq	%r14
00000000000a463f	popq	%r15
00000000000a4641	popq	%rbp
00000000000a4642	retq
00000000000a4643	movq	0x25e76(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000a464a	movq	0x10(%rcx), %rax
00000000000a464e	movq	%rax, 0x10(%r12)
00000000000a4653	movups	(%rcx), %xmm0
00000000000a4656	movups	%xmm0, (%r12)
00000000000a465b	movq	0x10(%rbp), %rax
00000000000a465f	movb	$0x0, (%rax)
00000000000a4662	jmp	0xa46c0
00000000000a4664	movq	0x10(%rbx), %rax
00000000000a4668	movq	%rax, -0x30(%rbp)
00000000000a466c	movups	(%rbx), %xmm0
00000000000a466f	movaps	%xmm0, -0x40(%rbp)
00000000000a4673	movq	-0x30(%rbp), %rax
00000000000a4677	movq	%rax, 0x28(%rsp)
00000000000a467c	movaps	-0x40(%rbp), %xmm0
00000000000a4680	movups	%xmm0, 0x18(%rsp)
00000000000a4685	movq	-0x50(%rbp), %rax
00000000000a4689	movq	%rax, 0x10(%rsp)
00000000000a468e	movups	-0x60(%rbp), %xmm0
00000000000a4692	movups	%xmm0, (%rsp)
00000000000a4696	leaq	-0x80(%rbp), %r14
00000000000a469a	movq	%r14, %rdi
00000000000a469d	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000a46a2	movq	0x10(%r14), %rax
00000000000a46a6	movq	%rax, 0x10(%rbx)
00000000000a46aa	movups	(%r14), %xmm0
00000000000a46ae	movups	%xmm0, (%rbx)
00000000000a46b1	movb	$0x1, %al
00000000000a46b3	movq	0x10(%rbp), %rcx
00000000000a46b7	movq	%rbx, %r12
00000000000a46ba	movb	%al, (%rcx)
00000000000a46bc	movq	-0x68(%rbp), %r14
00000000000a46c0	movq	0x10(%r12), %rax
00000000000a46c5	movq	%rax, -0x50(%rbp)
00000000000a46c9	movups	(%r12), %xmm0
00000000000a46ce	movaps	%xmm0, -0x60(%rbp)
00000000000a46d2	movq	0x10(%r14), %rax
00000000000a46d6	movq	%rax, -0x70(%rbp)
00000000000a46da	movups	(%r14), %xmm0
00000000000a46de	jmp	0xa45e9
00000000000a46e3	addb	%al, (%rax)
00000000000a46e5	addb	%dl, 0x48(%rbp)
00000000000a46e8	movl	%esp, %ebp
00000000000a46ea	pushq	%rbx
00000000000a46eb	pushq	%rax
00000000000a46ec	movq	%rdi, %rbx
00000000000a46ef	leaq	-0x10(%rbp), %r9
00000000000a46f3	callq	__ZN23OZChannelSegmentVisitor20mapProgressiveRepeatERK6CMTimeS2_S2_bRl ## OZChannelSegmentVisitor::mapProgressiveRepeat(CMTime const&, CMTime const&, CMTime const&, bool, long&)
00000000000a46f8	movq	%rbx, %rax
00000000000a46fb	addq	$0x8, %rsp
00000000000a46ff	popq	%rbx
00000000000a4700	popq	%rbp
00000000000a4701	retq
