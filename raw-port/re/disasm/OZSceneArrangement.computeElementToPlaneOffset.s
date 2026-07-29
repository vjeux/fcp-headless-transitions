__ZN18OZSceneArrangement27computeElementToPlaneOffsetERKNS_7ElementERK9PCVector4IdEdRK13OZRenderStateP9PCVector3IdE:
0000000000504a60	pushq	%rbp
0000000000504a61	movq	%rsp, %rbp
0000000000504a64	pushq	%r15
0000000000504a66	pushq	%r14
0000000000504a68	pushq	%r13
0000000000504a6a	pushq	%r12
0000000000504a6c	pushq	%rbx
0000000000504a6d	subq	$0x498, %rsp                    ## imm = 0x498
0000000000504a74	movq	%rcx, %rbx
0000000000504a77	movq	%rdx, %r14
0000000000504a7a	movsd	%xmm0, -0x40(%rbp)
0000000000504a7f	movq	%rsi, %r12
0000000000504a82	movq	%rdi, %r15
0000000000504a85	leaq	-0x4b8(%rbp), %rdi
0000000000504a8c	movq	%rdx, %rsi
0000000000504a8f	callq	__ZN13OZRenderStateC1ERKS_      ## OZRenderState::OZRenderState(OZRenderState const&)
0000000000504a94	movl	$0x1, -0x488(%rbp)
0000000000504a9e	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000504aa8	movq	%rax, -0x118(%rbp)
0000000000504aaf	movq	%rax, -0x140(%rbp)
0000000000504ab6	movq	%rax, -0x168(%rbp)
0000000000504abd	movq	%rax, -0x190(%rbp)
0000000000504ac4	xorps	%xmm0, %xmm0
0000000000504ac7	movups	%xmm0, -0x188(%rbp)
0000000000504ace	movups	%xmm0, -0x178(%rbp)
0000000000504ad5	movaps	%xmm0, -0x160(%rbp)
0000000000504adc	movaps	%xmm0, -0x150(%rbp)
0000000000504ae3	movups	%xmm0, -0x138(%rbp)
0000000000504aea	movups	%xmm0, -0x128(%rbp)
0000000000504af1	movq	%rax, -0x1b8(%rbp)
0000000000504af8	movq	%rax, -0x1e0(%rbp)
0000000000504aff	movq	%rax, -0x208(%rbp)
0000000000504b06	movq	%rax, -0x230(%rbp)
0000000000504b0d	movups	%xmm0, -0x228(%rbp)
0000000000504b14	movups	%xmm0, -0x218(%rbp)
0000000000504b1b	movaps	%xmm0, -0x200(%rbp)
0000000000504b22	movaps	%xmm0, -0x1f0(%rbp)
0000000000504b29	movups	%xmm0, -0x1d8(%rbp)
0000000000504b30	movups	%xmm0, -0x1c8(%rbp)
0000000000504b37	movupd	(%r12), %xmm0
0000000000504b3d	movupd	0x10(%r12), %xmm1
0000000000504b44	movapd	%xmm1, -0xb0(%rbp)
0000000000504b4c	movapd	%xmm0, -0xc0(%rbp)
0000000000504b54	movq	(%r15), %rax
0000000000504b57	movq	0x3b8(%rax), %rdi
0000000000504b5e	testq	%rdi, %rdi
0000000000504b61	je	0x504e43
0000000000504b67	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
0000000000504b6e	leaq	__ZTI15OZTransformNode(%rip), %rdx ## typeinfo for OZTransformNode
0000000000504b75	xorl	%ecx, %ecx
0000000000504b77	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000504b7c	testq	%rax, %rax
0000000000504b7f	je	0x504e43
0000000000504b85	movq	(%rax), %rcx
0000000000504b88	leaq	-0x190(%rbp), %rsi
0000000000504b8f	movq	%rax, %rdi
0000000000504b92	movq	%r14, %rdx
0000000000504b95	callq	*0x500(%rcx)
0000000000504b9b	movddup	-0xc0(%rbp), %xmm2              ## xmm2 = mem[0,0]
0000000000504ba3	movapd	-0x190(%rbp), %xmm1
0000000000504bab	movapd	-0x180(%rbp), %xmm4
0000000000504bb3	movapd	-0x170(%rbp), %xmm8
0000000000504bbc	movapd	-0x160(%rbp), %xmm6
0000000000504bc4	movapd	%xmm2, %xmm0
0000000000504bc8	mulpd	%xmm1, %xmm0
0000000000504bcc	movddup	-0xb8(%rbp), %xmm7              ## xmm7 = mem[0,0]
0000000000504bd4	movapd	%xmm7, %xmm3
0000000000504bd8	mulpd	%xmm8, %xmm3
0000000000504bdd	addpd	%xmm0, %xmm3
0000000000504be1	movapd	-0x150(%rbp), %xmm5
0000000000504be9	movddup	-0xb0(%rbp), %xmm11             ## xmm11 = mem[0,0]
0000000000504bf2	movapd	%xmm11, %xmm9
0000000000504bf7	mulpd	%xmm5, %xmm9
0000000000504bfc	addpd	%xmm3, %xmm9
0000000000504c01	movapd	-0x130(%rbp), %xmm10
0000000000504c0a	movddup	-0xa8(%rbp), %xmm0              ## xmm0 = mem[0,0]
0000000000504c12	movapd	%xmm0, %xmm3
0000000000504c16	mulpd	%xmm10, %xmm3
0000000000504c1b	addpd	%xmm9, %xmm3
0000000000504c20	movapd	%xmm3, -0xc0(%rbp)
0000000000504c28	mulpd	%xmm4, %xmm2
0000000000504c2c	mulpd	%xmm6, %xmm7
0000000000504c30	addpd	%xmm2, %xmm7
0000000000504c34	movapd	-0x140(%rbp), %xmm2
0000000000504c3c	mulpd	%xmm2, %xmm11
0000000000504c41	addpd	%xmm7, %xmm11
0000000000504c46	movapd	-0x120(%rbp), %xmm9
0000000000504c4f	mulpd	%xmm9, %xmm0
0000000000504c54	addpd	%xmm11, %xmm0
0000000000504c59	movapd	%xmm0, -0xb0(%rbp)
0000000000504c61	xorpd	%xmm7, %xmm7
0000000000504c65	movapd	%xmm1, %xmm11
0000000000504c6a	mulsd	%xmm7, %xmm11
0000000000504c6f	mulsd	%xmm7, %xmm8
0000000000504c74	addsd	%xmm11, %xmm8
0000000000504c79	unpckhpd	%xmm5, %xmm1                    ## xmm1 = xmm1[1],xmm5[1]
0000000000504c7d	mulsd	%xmm7, %xmm5
0000000000504c81	addsd	%xmm8, %xmm5
0000000000504c86	subsd	%xmm10, %xmm5
0000000000504c8b	movsd	-0x168(%rbp), %xmm8
0000000000504c94	mulsd	%xmm7, %xmm8
0000000000504c99	xorpd	%xmm10, %xmm10
0000000000504c9e	mulpd	%xmm10, %xmm1
0000000000504ca3	addsd	%xmm1, %xmm8
0000000000504ca8	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
0000000000504cac	addsd	%xmm8, %xmm1
0000000000504cb1	subsd	-0x128(%rbp), %xmm1
0000000000504cb9	movapd	%xmm4, %xmm8
0000000000504cbe	mulsd	%xmm7, %xmm8
0000000000504cc3	mulsd	%xmm7, %xmm6
0000000000504cc7	addsd	%xmm8, %xmm6
0000000000504ccc	unpckhpd	%xmm2, %xmm4                    ## xmm4 = xmm4[1],xmm2[1]
0000000000504cd0	mulsd	%xmm7, %xmm2
0000000000504cd4	addsd	%xmm6, %xmm2
0000000000504cd8	subsd	%xmm9, %xmm2
0000000000504cdd	mulsd	-0x158(%rbp), %xmm7
0000000000504ce5	mulpd	%xmm10, %xmm4
0000000000504cea	addsd	%xmm4, %xmm7
0000000000504cee	unpckhpd	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
0000000000504cf2	addsd	%xmm7, %xmm4
0000000000504cf6	subsd	-0x118(%rbp), %xmm4
0000000000504cfe	movapd	%xmm5, %xmm6
0000000000504d02	unpcklpd	%xmm3, %xmm6                    ## xmm6 = xmm6[0],xmm3[0]
0000000000504d06	mulpd	%xmm6, %xmm6
0000000000504d0a	movapd	%xmm3, %xmm7
0000000000504d0e	blendpd	$0x1, %xmm1, %xmm7              ## xmm7 = xmm1[0],xmm7[1]
0000000000504d14	mulpd	%xmm7, %xmm7
0000000000504d18	addpd	%xmm6, %xmm7
0000000000504d1c	movapd	%xmm2, %xmm6
0000000000504d20	unpcklpd	%xmm0, %xmm6                    ## xmm6 = xmm6[0],xmm0[0]
0000000000504d24	mulpd	%xmm6, %xmm6
0000000000504d28	addpd	%xmm7, %xmm6
0000000000504d2c	movapd	%xmm0, %xmm7
0000000000504d30	blendpd	$0x1, %xmm4, %xmm7              ## xmm7 = xmm4[0],xmm7[1]
0000000000504d36	mulpd	%xmm7, %xmm7
0000000000504d3a	addpd	%xmm6, %xmm7
0000000000504d3e	sqrtpd	%xmm7, %xmm6
0000000000504d42	movapd	%xmm3, %xmm8
0000000000504d47	unpckhpd	%xmm3, %xmm8                    ## xmm8 = xmm8[1],xmm3[1]
0000000000504d4c	mulsd	%xmm6, %xmm8
0000000000504d51	movapd	%xmm0, %xmm7
0000000000504d55	mulsd	%xmm6, %xmm7
0000000000504d59	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
0000000000504d5d	mulsd	%xmm6, %xmm0
0000000000504d61	unpcklpd	%xmm5, %xmm3                    ## xmm3 = xmm3[0],xmm5[0]
0000000000504d65	mulpd	%xmm6, %xmm3
0000000000504d69	unpckhpd	%xmm6, %xmm6                    ## xmm6 = xmm6[1,1]
0000000000504d6d	mulsd	%xmm6, %xmm1
0000000000504d71	mulsd	%xmm6, %xmm2
0000000000504d75	movapd	%xmm3, %xmm5
0000000000504d79	unpckhpd	%xmm3, %xmm5                    ## xmm5 = xmm5[1],xmm3[1]
0000000000504d7d	movapd	%xmm3, %xmm9
0000000000504d82	subsd	%xmm5, %xmm9
0000000000504d87	andpd	0x202080(%rip), %xmm9
0000000000504d90	mulsd	%xmm4, %xmm6
0000000000504d94	movsd	0x202134(%rip), %xmm4
0000000000504d9c	ucomisd	%xmm9, %xmm4
0000000000504da1	jbe	0x504df1
0000000000504da3	movapd	%xmm8, %xmm9
0000000000504da8	subsd	%xmm1, %xmm9
0000000000504dad	andpd	0x20205a(%rip), %xmm9
0000000000504db6	ucomisd	%xmm9, %xmm4
0000000000504dbb	jbe	0x504df1
0000000000504dbd	movapd	%xmm7, %xmm9
0000000000504dc2	subsd	%xmm2, %xmm9
0000000000504dc7	andpd	0x202040(%rip), %xmm9
0000000000504dd0	ucomisd	%xmm9, %xmm4
0000000000504dd5	jbe	0x504df1
0000000000504dd7	movapd	%xmm0, %xmm9
0000000000504ddc	subsd	%xmm6, %xmm9
0000000000504de1	andpd	0x202026(%rip), %xmm9
0000000000504dea	ucomisd	%xmm9, %xmm4
0000000000504def	ja	0x504e3c
0000000000504df1	addsd	%xmm3, %xmm5
0000000000504df5	andpd	0x202013(%rip), %xmm5
0000000000504dfd	ucomisd	%xmm5, %xmm4
0000000000504e01	jbe	0x504e43
0000000000504e03	addsd	%xmm1, %xmm8
0000000000504e08	andpd	0x201fff(%rip), %xmm8
0000000000504e11	ucomisd	%xmm8, %xmm4
0000000000504e16	jbe	0x504e43
0000000000504e18	addsd	%xmm2, %xmm7
0000000000504e1c	andpd	0x201fec(%rip), %xmm7
0000000000504e24	ucomisd	%xmm7, %xmm4
0000000000504e28	jbe	0x504e43
0000000000504e2a	addsd	%xmm6, %xmm0
0000000000504e2e	andpd	0x201fda(%rip), %xmm0
0000000000504e36	ucomisd	%xmm0, %xmm4
0000000000504e3a	jbe	0x504e43
0000000000504e3c	xorl	%eax, %eax
0000000000504e3e	jmp	0x50551d
0000000000504e43	movq	%rbx, -0xf8(%rbp)
0000000000504e4a	movq	(%r15), %rdi
0000000000504e4d	movq	(%rdi), %rax
0000000000504e50	leaq	-0x230(%rbp), %r12
0000000000504e57	leaq	-0x4b8(%rbp), %rdx
0000000000504e5e	movq	%r12, %rsi
0000000000504e61	callq	*0x500(%rax)
0000000000504e67	movaps	0x202832(%rip), %xmm0
0000000000504e6e	movaps	%xmm0, -0x390(%rbp)
0000000000504e75	movaps	%xmm0, -0x3a0(%rbp)
0000000000504e7c	movaps	%xmm0, -0x3b0(%rbp)
0000000000504e83	movq	(%r15), %rdi
0000000000504e86	movq	(%rdi), %rax
0000000000504e89	leaq	-0x3b0(%rbp), %r15
0000000000504e90	movq	%r15, %rsi
0000000000504e93	movq	%r14, %rdx
0000000000504e96	callq	*0x568(%rax)
0000000000504e9c	leaq	-0x320(%rbp), %rdi
0000000000504ea3	leaq	-0xc0(%rbp), %rdx
0000000000504eaa	movq	%r15, %rsi
0000000000504ead	movq	%r12, %rcx
0000000000504eb0	movsd	-0x40(%rbp), %xmm0
0000000000504eb5	callq	__ZN18OZSceneArrangement16findExtremePointERK5PCBoxIdERK9PCVector4IdERK14PCMatrix44TmplIdEd ## OZSceneArrangement::findExtremePoint(PCBox<double> const&, PCVector4<double> const&, PCMatrix44Tmpl<double> const&, double)
0000000000504eba	movsd	-0x310(%rbp), %xmm2
0000000000504ec2	movsd	-0x1c0(%rbp), %xmm0
0000000000504eca	mulsd	%xmm2, %xmm0
0000000000504ece	movsd	-0x200(%rbp), %xmm1
0000000000504ed6	movapd	%xmm2, -0x360(%rbp)
0000000000504ede	mulsd	%xmm2, %xmm1
0000000000504ee2	movapd	-0x320(%rbp), %xmm5
0000000000504eea	movsd	-0x318(%rbp), %xmm3
0000000000504ef2	movapd	-0x1d0(%rbp), %xmm2
0000000000504efa	mulpd	%xmm5, %xmm2
0000000000504efe	movapd	%xmm2, %xmm4
0000000000504f02	unpckhpd	%xmm2, %xmm4                    ## xmm4 = xmm4[1],xmm2[1]
0000000000504f06	addsd	%xmm2, %xmm4
0000000000504f0a	addsd	%xmm0, %xmm4
0000000000504f0e	addsd	-0x1b8(%rbp), %xmm4
0000000000504f16	movapd	%xmm4, -0x110(%rbp)
0000000000504f1e	movaps	-0x230(%rbp), %xmm0
0000000000504f25	movaps	%xmm0, -0x330(%rbp)
0000000000504f2c	movaps	-0x220(%rbp), %xmm0
0000000000504f33	movaps	%xmm0, -0xa0(%rbp)
0000000000504f3a	movaps	-0x1f0(%rbp), %xmm0
0000000000504f41	movaps	%xmm0, -0x340(%rbp)
0000000000504f48	movaps	-0x1e0(%rbp), %xmm0
0000000000504f4f	movaps	%xmm0, -0xf0(%rbp)
0000000000504f56	movsd	-0x210(%rbp), %xmm0
0000000000504f5e	movapd	%xmm5, -0x350(%rbp)
0000000000504f66	mulsd	%xmm5, %xmm0
0000000000504f6a	mulsd	-0x208(%rbp), %xmm3
0000000000504f72	addsd	%xmm0, %xmm3
0000000000504f76	addsd	%xmm1, %xmm3
0000000000504f7a	addsd	-0x1f8(%rbp), %xmm3
0000000000504f82	movsd	%xmm3, -0x68(%rbp)
0000000000504f87	movaps	-0xc0(%rbp), %xmm0
0000000000504f8e	movaps	%xmm0, -0x90(%rbp)
0000000000504f95	movsd	-0xb0(%rbp), %xmm0
0000000000504f9d	movaps	%xmm0, -0x80(%rbp)
0000000000504fa1	movq	$0x0, -0x1b0(%rbp)
0000000000504fac	movapd	0x20c5dc(%rip), %xmm0
0000000000504fb4	movupd	%xmm0, -0x1a8(%rbp)
0000000000504fbc	leaq	-0x190(%rbp), %rax
0000000000504fc3	movq	%rax, -0x198(%rbp)
0000000000504fca	movq	$0x0, -0x320(%rbp)
0000000000504fd5	movl	$0x0, -0x318(%rbp)
0000000000504fdf	movl	$0x1, -0x314(%rbp)
0000000000504fe9	xorpd	%xmm0, %xmm0
0000000000504fed	movupd	%xmm0, -0x310(%rbp)
0000000000504ff5	movq	$0x0, -0x300(%rbp)
0000000000505000	movl	$0x1, -0x2f8(%rbp)
000000000050500a	movl	$0x1, -0x2f4(%rbp)
0000000000505014	movupd	%xmm0, -0x2f0(%rbp)
000000000050501c	movq	$0x0, -0x2e0(%rbp)
0000000000505027	movabsq	$0x100000001, %rax              ## imm = 0x100000001
0000000000505031	movq	%rax, -0x2d8(%rbp)
0000000000505038	movupd	%xmm0, -0x2d0(%rbp)
0000000000505040	movabsq	$0x100000000, %rcx              ## imm = 0x100000000
000000000050504a	movq	%rcx, -0x2c0(%rbp)
0000000000505051	movupd	%xmm0, -0x2b8(%rbp)
0000000000505059	movq	%rcx, -0x2a8(%rbp)
0000000000505060	movupd	%xmm0, -0x2a0(%rbp)
0000000000505068	movq	%rcx, -0x290(%rbp)
000000000050506f	movupd	%xmm0, -0x288(%rbp)
0000000000505077	movq	$0x0, -0x278(%rbp)
0000000000505082	movq	%rax, -0x270(%rbp)
0000000000505089	movq	%rcx, -0x258(%rbp)
0000000000505090	movupd	%xmm0, -0x268(%rbp)
0000000000505098	movq	$0x0, -0x250(%rbp)
00000000005050a3	movabsq	$0x3f1a36e2eb1c432d, %rax       ## imm = 0x3F1A36E2EB1C432D
00000000005050ad	movq	%rax, -0x248(%rbp)
00000000005050b4	leaq	-0x320(%rbp), %rdi
00000000005050bb	leaq	-0x1b0(%rbp), %rsi
00000000005050c2	callq	0x6dd33e                        ## symbol stub for: __Z8_svdCallR5PCSvdIdERK11PCGenMatrixIdE
00000000005050c7	movl	-0x2c0(%rbp), %ebx
00000000005050cd	testl	%ebx, %ebx
00000000005050cf	jle	0x5052cb
00000000005050d5	leaq	-0x2c8(%rbp), %r12
00000000005050dc	leal	-0x1(%rbx), %r15d
00000000005050e0	xorl	%r13d, %r13d
00000000005050e3	movl	%ebx, %r14d
00000000005050e6	nopw	%cs:(%rax,%rax)
00000000005050f0	leal	-0x1(%r14), %esi
00000000005050f4	movq	%r12, %rdi
00000000005050f7	callq	__ZN11PCGenVectorIdEclEi        ## PCGenVector<double>::operator()(int)
00000000005050fc	movsd	(%rax), %xmm0
0000000000505100	andpd	0x201d08(%rip), %xmm0
0000000000505108	ucomisd	-0x248(%rbp), %xmm0
0000000000505110	ja	0x50511f
0000000000505112	incl	%r13d
0000000000505115	decl	%r14d
0000000000505118	jg	0x5050f0
000000000050511a	jmp	0x5052cb
000000000050511f	testl	%r13d, %r13d
0000000000505122	je	0x5052cb
0000000000505128	leaq	-0x2e8(%rbp), %r12
000000000050512f	movq	%r12, %rdi
0000000000505132	movl	%r14d, %esi
0000000000505135	callq	__ZNK11PCGenMatrixIdE13checkColIndexEi ## PCGenMatrix<double>::checkColIndex(int) const
000000000050513a	movq	%r12, %rdi
000000000050513d	movl	%r15d, %esi
0000000000505140	callq	__ZNK11PCGenMatrixIdE13checkColIndexEi ## PCGenMatrix<double>::checkColIndex(int) const
0000000000505145	movl	-0x2e0(%rbp), %eax
000000000050514b	movslq	-0x2d4(%rbp), %rcx
0000000000505152	movsd	-0x2d8(%rbp), %xmm0
000000000050515a	movq	-0x2d0(%rbp), %rdx
0000000000505161	movq	-0x2e8(%rbp), %rdi
0000000000505168	movq	%rdi, -0x60(%rbp)
000000000050516c	testq	%rdi, %rdi
000000000050516f	movapd	-0x80(%rbp), %xmm5
0000000000505174	je	0x505179
0000000000505176	incl	-0x4(%rdi)
0000000000505179	movslq	%r14d, %rsi
000000000050517c	imulq	%rsi, %rcx
0000000000505180	leaq	(%rdx,%rcx,8), %rcx
0000000000505184	movl	%eax, -0x58(%rbp)
0000000000505187	movl	%r13d, -0x54(%rbp)
000000000050518b	movlps	%xmm0, -0x50(%rbp)
000000000050518f	movq	%rcx, -0x48(%rbp)
0000000000505193	movapd	%xmm5, %xmm8
0000000000505198	movapd	-0x90(%rbp), %xmm7
00000000005051a0	testl	%r13d, %r13d
00000000005051a3	jle	0x505307
00000000005051a9	xorl	%r14d, %r14d
00000000005051ac	leaq	-0x60(%rbp), %r15
00000000005051b0	leaq	-0x380(%rbp), %r12
00000000005051b7	leaq	-0xd8(%rbp), %r13
00000000005051be	movsd	%xmm5, -0x30(%rbp)
00000000005051c3	movapd	-0x90(%rbp), %xmm0
00000000005051cb	movapd	%xmm0, -0x40(%rbp)
00000000005051d0	jmp	0x505245
00000000005051d2	nopw	%cs:(%rax,%rax)
00000000005051e0	movsd	-0x370(%rbp), %xmm0
00000000005051e8	mulsd	%xmm0, %xmm1
00000000005051ec	movapd	-0x380(%rbp), %xmm2
00000000005051f4	movapd	-0x90(%rbp), %xmm3
00000000005051fc	mulpd	%xmm2, %xmm3
0000000000505200	movapd	%xmm3, %xmm4
0000000000505204	unpckhpd	%xmm3, %xmm4                    ## xmm4 = xmm4[1],xmm3[1]
0000000000505208	addsd	%xmm3, %xmm4
000000000050520c	addsd	%xmm1, %xmm4
0000000000505210	movddup	%xmm4, %xmm1                    ## xmm1 = xmm4[0,0]
0000000000505214	mulpd	%xmm2, %xmm1
0000000000505218	movapd	-0x40(%rbp), %xmm2
000000000050521d	subpd	%xmm1, %xmm2
0000000000505221	movapd	%xmm2, -0x40(%rbp)
0000000000505226	mulsd	%xmm0, %xmm4
000000000050522a	movsd	-0x30(%rbp), %xmm0
000000000050522f	subsd	%xmm4, %xmm0
0000000000505233	movsd	%xmm0, -0x30(%rbp)
0000000000505238	incl	%r14d
000000000050523b	cmpl	-0x54(%rbp), %r14d
000000000050523f	jge	0x50552f
0000000000505245	movq	%r15, %rdi
0000000000505248	movl	%r14d, %esi
000000000050524b	callq	__ZNK11PCGenMatrixIdE13checkColIndexEi ## PCGenMatrix<double>::checkColIndex(int) const
0000000000505250	movl	-0x58(%rbp), %eax
0000000000505253	movl	-0x50(%rbp), %ecx
0000000000505256	movq	-0x48(%rbp), %rdx
000000000050525a	movslq	-0x4c(%rbp), %rsi
000000000050525e	movq	-0x60(%rbp), %rdi
0000000000505262	movq	%rdi, -0xd8(%rbp)
0000000000505269	testq	%rdi, %rdi
000000000050526c	je	0x505271
000000000050526e	incl	-0x4(%rdi)
0000000000505271	movslq	%r14d, %rdi
0000000000505274	imulq	%rdi, %rsi
0000000000505278	leaq	(%rdx,%rsi,8), %rdx
000000000050527c	movl	%eax, -0xd0(%rbp)
0000000000505282	movl	%ecx, -0xcc(%rbp)
0000000000505288	movq	%rdx, -0xc8(%rbp)
000000000050528f	movq	%r12, %rdi
0000000000505292	movq	%r13, %rsi
0000000000505295	callq	__ZNK11PCGenVectorIdEcv9PCVector3IT_EIdEEv ## PCGenVector<double>::operator PCVector3<double><double>() const
000000000050529a	movq	-0xd8(%rbp), %rdi
00000000005052a1	testq	%rdi, %rdi
00000000005052a4	movapd	-0x80(%rbp), %xmm1
00000000005052a9	je	0x5051e0
00000000005052af	decl	-0x4(%rdi)
00000000005052b2	jne	0x5051e0
00000000005052b8	addq	$-0x8, %rdi
00000000005052bc	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000005052c1	movapd	-0x80(%rbp), %xmm1
00000000005052c6	jmp	0x5051e0
00000000005052cb	movq	$0x0, -0x60(%rbp)
00000000005052d3	movdqa	0x20c2c5(%rip), %xmm0
00000000005052db	pinsrd	$0x0, %ebx, %xmm0
00000000005052e1	pshufd	$0x24, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,2,0]
00000000005052e6	movdqu	%xmm0, -0x58(%rbp)
00000000005052eb	movq	$0x0, -0x48(%rbp)
00000000005052f3	xorl	%edi, %edi
00000000005052f5	movapd	-0x80(%rbp), %xmm5
00000000005052fa	movapd	%xmm5, %xmm8
00000000005052ff	movapd	-0x90(%rbp), %xmm7
0000000000505307	movapd	-0x350(%rbp), %xmm2
000000000050530f	movapd	%xmm2, %xmm0
0000000000505313	shufpd	$0x1, %xmm2, %xmm0              ## xmm0 = xmm0[1],xmm2[0]
0000000000505318	movapd	-0x330(%rbp), %xmm4
0000000000505320	movapd	%xmm4, %xmm1
0000000000505324	movapd	-0x340(%rbp), %xmm3
000000000050532c	shufpd	$0x1, %xmm3, %xmm1              ## xmm1 = xmm1[1],xmm3[0]
0000000000505331	mulpd	%xmm0, %xmm1
0000000000505335	blendpd	$0x1, %xmm4, %xmm3              ## xmm3 = xmm4[0],xmm3[1]
000000000050533b	mulpd	%xmm2, %xmm3
000000000050533f	addpd	%xmm1, %xmm3
0000000000505343	movddup	-0x360(%rbp), %xmm1             ## xmm1 = mem[0,0]
000000000050534b	movapd	-0xa0(%rbp), %xmm4
0000000000505353	movapd	%xmm4, %xmm0
0000000000505357	movapd	-0xf0(%rbp), %xmm6
000000000050535f	unpcklpd	%xmm6, %xmm0                    ## xmm0 = xmm0[0],xmm6[0]
0000000000505363	mulpd	%xmm1, %xmm0
0000000000505367	addpd	%xmm3, %xmm0
000000000050536b	movapd	%xmm7, %xmm1
000000000050536f	mulpd	%xmm7, %xmm1
0000000000505373	movapd	%xmm1, %xmm2
0000000000505377	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
000000000050537b	addsd	%xmm1, %xmm2
000000000050537f	movapd	%xmm8, %xmm1
0000000000505384	mulsd	%xmm8, %xmm1
0000000000505389	addsd	%xmm2, %xmm1
000000000050538d	sqrtsd	%xmm1, %xmm1
0000000000505391	movapd	0x201a77(%rip), %xmm2
0000000000505399	andpd	%xmm1, %xmm2
000000000050539d	movsd	0x20007b(%rip), %xmm3
00000000005053a5	xorl	%eax, %eax
00000000005053a7	ucomisd	%xmm2, %xmm3
00000000005053ab	seta	%cl
00000000005053ae	unpckhpd	%xmm6, %xmm4                    ## xmm4 = xmm4[1],xmm6[1]
00000000005053b2	movddup	%xmm1, %xmm2                    ## xmm2 = xmm1[0,0]
00000000005053b6	divpd	%xmm2, %xmm7
00000000005053ba	movapd	%xmm7, -0x40(%rbp)
00000000005053bf	ja	0x5053cb
00000000005053c1	divsd	%xmm1, %xmm8
00000000005053c6	movapd	%xmm8, %xmm5
00000000005053cb	movsd	%xmm5, -0x30(%rbp)
00000000005053d0	movapd	%xmm4, %xmm1
00000000005053d4	addpd	%xmm0, %xmm1
00000000005053d8	movapd	-0x110(%rbp), %xmm2
00000000005053e0	movddup	%xmm2, %xmm4                    ## xmm4 = xmm2[0,0]
00000000005053e4	movb	%cl, %al
00000000005053e6	movd	%eax, %xmm0
00000000005053ea	pshufd	$0x44, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,0,1]
00000000005053ef	psllq	$0x3f, %xmm0
00000000005053f4	movapd	-0x40(%rbp), %xmm3
00000000005053f9	blendvpd	%xmm0, -0x90(%rbp), %xmm3
0000000000505402	movapd	%xmm3, -0x40(%rbp)
0000000000505407	testq	%rdi, %rdi
000000000050540a	movq	-0xf8(%rbp), %rbx
0000000000505411	je	0x505449
0000000000505413	decl	-0x4(%rdi)
0000000000505416	jne	0x505449
0000000000505418	addq	$-0x8, %rdi
000000000050541c	movapd	%xmm1, -0xa0(%rbp)
0000000000505424	movapd	%xmm4, -0xf0(%rbp)
000000000050542c	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000505431	movapd	-0xf0(%rbp), %xmm4
0000000000505439	movapd	-0x110(%rbp), %xmm2
0000000000505441	movapd	-0xa0(%rbp), %xmm1
0000000000505449	movsd	-0x68(%rbp), %xmm0
000000000050544e	divsd	%xmm2, %xmm0
0000000000505452	movsd	%xmm0, -0x68(%rbp)
0000000000505457	divpd	%xmm4, %xmm1
000000000050545b	movapd	%xmm1, -0xa0(%rbp)
0000000000505463	leaq	-0x320(%rbp), %rdi
000000000050546a	callq	__ZN5PCSvdIdED2Ev               ## PCSvd<double>::~PCSvd()
000000000050546f	movq	-0x1b0(%rbp), %rdi
0000000000505476	testq	%rdi, %rdi
0000000000505479	je	0x505489
000000000050547b	decl	-0x4(%rdi)
000000000050547e	jne	0x505489
0000000000505480	addq	$-0x8, %rdi
0000000000505484	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000505489	movapd	-0x90(%rbp), %xmm4
0000000000505491	movapd	%xmm4, %xmm0
0000000000505495	unpckhpd	%xmm4, %xmm0                    ## xmm0 = xmm0[1],xmm4[1]
0000000000505499	movapd	%xmm4, %xmm1
000000000050549d	movapd	-0x40(%rbp), %xmm5
00000000005054a2	mulpd	%xmm5, %xmm1
00000000005054a6	movapd	%xmm1, %xmm2
00000000005054aa	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
00000000005054ae	addsd	%xmm1, %xmm2
00000000005054b2	movapd	-0x80(%rbp), %xmm3
00000000005054b7	unpcklpd	%xmm3, %xmm4                    ## xmm4 = xmm4[0],xmm3[0]
00000000005054bb	movsd	-0x30(%rbp), %xmm6
00000000005054c0	mulsd	%xmm6, %xmm3
00000000005054c4	addsd	%xmm2, %xmm3
00000000005054c8	divsd	%xmm3, %xmm6
00000000005054cc	movsd	-0x68(%rbp), %xmm1
00000000005054d1	mulsd	%xmm0, %xmm1
00000000005054d5	movapd	-0xa0(%rbp), %xmm2
00000000005054dd	mulpd	%xmm4, %xmm2
00000000005054e1	addsd	%xmm2, %xmm1
00000000005054e5	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000005054e9	addsd	%xmm1, %xmm2
00000000005054ed	addsd	-0xa8(%rbp), %xmm2
00000000005054f5	xorpd	0x202063(%rip), %xmm2
00000000005054fd	mulsd	%xmm2, %xmm6
0000000000505501	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
0000000000505505	divpd	%xmm0, %xmm5
0000000000505509	pshufd	$0x44, %xmm2, %xmm0             ## xmm0 = xmm2[0,1,0,1]
000000000050550e	mulpd	%xmm5, %xmm0
0000000000505512	movupd	%xmm0, (%rbx)
0000000000505516	movsd	%xmm6, 0x10(%rbx)
000000000050551b	movb	$0x1, %al
000000000050551d	addq	$0x498, %rsp                    ## imm = 0x498
0000000000505524	popq	%rbx
0000000000505525	popq	%r12
0000000000505527	popq	%r13
0000000000505529	popq	%r14
000000000050552b	popq	%r15
000000000050552d	popq	%rbp
000000000050552e	retq
000000000050552f	movq	-0x60(%rbp), %rdi
0000000000505533	movaps	-0x80(%rbp), %xmm5
0000000000505537	movaps	-0x40(%rbp), %xmm7
000000000050553b	movsd	-0x30(%rbp), %xmm8
0000000000505541	jmp	0x505307
0000000000505546	jmp	0x505585
0000000000505548	jmp	0x505585
000000000050554a	movq	%rax, %rbx
000000000050554d	jmp	0x50556c
000000000050554f	movq	%rax, %rbx
0000000000505552	movq	-0xd8(%rbp), %rdi
0000000000505559	testq	%rdi, %rdi
000000000050555c	je	0x50556c
000000000050555e	decl	-0x4(%rdi)
0000000000505561	jne	0x50556c
0000000000505563	addq	$-0x8, %rdi
0000000000505567	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000050556c	movq	-0x60(%rbp), %rdi
0000000000505570	testq	%rdi, %rdi
0000000000505573	je	0x505588
0000000000505575	decl	-0x4(%rdi)
0000000000505578	jne	0x505588
000000000050557a	addq	$-0x8, %rdi
000000000050557e	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000505583	jmp	0x505588
0000000000505585	movq	%rax, %rbx
0000000000505588	leaq	-0x320(%rbp), %rdi
000000000050558f	callq	__ZN5PCSvdIdED2Ev               ## PCSvd<double>::~PCSvd()
0000000000505594	movq	-0x1b0(%rbp), %rdi
000000000050559b	testq	%rdi, %rdi
000000000050559e	je	0x5055ae
00000000005055a0	decl	-0x4(%rdi)
00000000005055a3	jne	0x5055ae
00000000005055a5	addq	$-0x8, %rdi
00000000005055a9	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000005055ae	movq	%rbx, %rdi
00000000005055b1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005055b6	nopw	%cs:(%rax,%rax)
