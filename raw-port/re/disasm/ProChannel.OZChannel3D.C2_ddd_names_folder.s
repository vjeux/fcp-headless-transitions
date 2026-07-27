__ZN11OZChannel3DC2EdddRK8PCStringS2_S2_S2_P15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000048e58	pushq	%rbp
0000000000048e59	movq	%rsp, %rbp
0000000000048e5c	pushq	%r15
0000000000048e5e	pushq	%r14
0000000000048e60	pushq	%r13
0000000000048e62	pushq	%r12
0000000000048e64	pushq	%rbx
0000000000048e65	subq	$0x58, %rsp
0000000000048e69	movq	%r9, -0x48(%rbp)
0000000000048e6d	movq	%r8, -0x58(%rbp)
0000000000048e71	movq	%rcx, -0x40(%rbp)
0000000000048e75	movq	%rdx, %r15
0000000000048e78	movq	%rsi, %r14
0000000000048e7b	movsd	%xmm2, -0x50(%rbp)
0000000000048e80	movsd	%xmm1, -0x38(%rbp)
0000000000048e85	movsd	%xmm0, -0x30(%rbp)
0000000000048e8a	movq	%rdi, %rbx
0000000000048e8d	movq	0x28(%rbp), %r12
0000000000048e91	movq	0x30(%rbp), %r13
0000000000048e95	callq	__ZN19OZChannel3D_Factory11getInstanceEv ## OZChannel3D_Factory::getInstance()
0000000000048e9a	movq	%r13, 0x20(%rsp)
0000000000048e9f	movq	%r12, 0x18(%rsp)
0000000000048ea4	movl	0x20(%rbp), %ecx
0000000000048ea7	movl	%ecx, 0x10(%rsp)
0000000000048eab	movl	0x18(%rbp), %ecx
0000000000048eae	movl	%ecx, 0x8(%rsp)
0000000000048eb2	movl	0x10(%rbp), %ecx
0000000000048eb5	movl	%ecx, (%rsp)
0000000000048eb8	movq	%rbx, %rdi
0000000000048ebb	movsd	-0x30(%rbp), %xmm0
0000000000048ec0	movsd	-0x38(%rbp), %xmm1
0000000000048ec5	movq	%rax, %rsi
0000000000048ec8	movq	%r14, %rdx
0000000000048ecb	movq	%r15, %rcx
0000000000048ece	movq	-0x40(%rbp), %r8
0000000000048ed2	movq	-0x48(%rbp), %r9
0000000000048ed6	callq	__ZN11OZChannel2DC2EddP9OZFactoryRK8PCStringS4_S4_P15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(double, double, OZFactory*, PCString const&, PCString const&, PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048edb	leaq	0x8dc5e(%rip), %rax
0000000000048ee2	movq	%rax, (%rbx)
0000000000048ee5	leaq	0x8dfa4(%rip), %rax
0000000000048eec	movq	%rax, 0x10(%rbx)
0000000000048ef0	leaq	0x1b8(%rbx), %rdi
0000000000048ef7	movq	%r13, (%rsp)
0000000000048efb	movsd	-0x50(%rbp), %xmm0
0000000000048f00	movq	-0x58(%rbp), %rsi
0000000000048f04	movq	%rbx, %rdx
0000000000048f07	movl	$0x3, %ecx
0000000000048f0c	xorl	%r8d, %r8d
0000000000048f0f	movq	%r12, %r9
0000000000048f12	callq	__ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000048f17	addq	$0x58, %rsp
0000000000048f1b	popq	%rbx
0000000000048f1c	popq	%r12
0000000000048f1e	popq	%r13
0000000000048f20	popq	%r14
0000000000048f22	popq	%r15
0000000000048f24	popq	%rbp
0000000000048f25	retq
0000000000048f26	movq	%rax, %r14
0000000000048f29	movq	%rbx, %rdi
0000000000048f2c	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000048f31	movq	%r14, %rdi
0000000000048f34	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000048f39	nop
