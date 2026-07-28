__ZN20OZObjectTrackerUtils24generateSuperEllipseGridERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEER14PCMatrix44TmplIdERKS4_SE_SE_ddd:
0000000000cb3df0	pushq	%rbp
0000000000cb3df1	movq	%rsp, %rbp
0000000000cb3df4	pushq	%r15
0000000000cb3df6	pushq	%r14
0000000000cb3df8	pushq	%r13
0000000000cb3dfa	pushq	%r12
0000000000cb3dfc	pushq	%rbx
0000000000cb3dfd	subq	$0x98, %rsp
0000000000cb3e04	movsd	%xmm2, -0x48(%rbp)
0000000000cb3e09	movsd	%xmm1, -0x78(%rbp)
0000000000cb3e0e	movsd	%xmm0, -0x58(%rbp)
0000000000cb3e13	movq	%r8, -0x90(%rbp)
0000000000cb3e1a	movq	%rdx, %r12
0000000000cb3e1d	movq	%rsi, -0x88(%rbp)
0000000000cb3e24	movq	%rdi, -0x80(%rbp)
0000000000cb3e28	movupd	(%rdx), %xmm1
0000000000cb3e2c	movupd	(%rcx), %xmm0
0000000000cb3e30	movapd	%xmm1, -0xc0(%rbp)
0000000000cb3e38	mulpd	%xmm1, %xmm0
0000000000cb3e3c	movapd	%xmm0, %xmm1
0000000000cb3e40	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000cb3e44	maxsd	%xmm0, %xmm1
0000000000cb3e48	andpd	0x8b8c40(%rip), %xmm1
0000000000cb3e50	movsd	0x8b8ba8(%rip), %xmm0
0000000000cb3e58	divsd	%xmm1, %xmm0
0000000000cb3e5c	movsd	%xmm0, -0x50(%rbp)
0000000000cb3e61	movsd	0x8(%rdx), %xmm0
0000000000cb3e66	movsd	%xmm0, -0x98(%rbp)
0000000000cb3e6e	xorps	%xmm0, %xmm0
0000000000cb3e71	movaps	%xmm0, -0x40(%rbp)
0000000000cb3e75	movq	$0x0, -0x30(%rbp)
0000000000cb3e7d	movsd	0x8bbe6b(%rip), %xmm0
0000000000cb3e85	leaq	-0xb0(%rbp), %r13
0000000000cb3e8c	leaq	-0xa8(%rbp), %rbx
0000000000cb3e93	leaq	-0x40(%rbp), %r14
0000000000cb3e97	leaq	-0x70(%rbp), %r15
0000000000cb3e9b	nopl	(%rax,%rax)
0000000000cb3ea0	movsd	%xmm0, -0xa0(%rbp)
0000000000cb3ea8	movaps	-0xc0(%rbp), %xmm1
0000000000cb3eaf	movsd	-0x98(%rbp), %xmm2
0000000000cb3eb7	movsd	-0x58(%rbp), %xmm3
0000000000cb3ebc	movq	%r13, %rdi
0000000000cb3ebf	movq	%rbx, %rsi
0000000000cb3ec2	callq	0x1495fdc                       ## symbol stub for: __ZN11PCAlgorithm12superEllipseEddddRdS0_
0000000000cb3ec7	movsd	-0xb0(%rbp), %xmm0
0000000000cb3ecf	movsd	-0xa8(%rbp), %xmm1
0000000000cb3ed7	movsd	%xmm0, -0x70(%rbp)
0000000000cb3edc	movsd	%xmm1, -0x68(%rbp)
0000000000cb3ee1	movq	%r14, %rdi
0000000000cb3ee4	movq	%r15, %rsi
0000000000cb3ee7	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::push_back[abi:nqe210106](PCVector2<double> const&)
0000000000cb3eec	movsd	-0xa0(%rbp), %xmm0
0000000000cb3ef4	subsd	-0x50(%rbp), %xmm0
0000000000cb3ef9	xorpd	%xmm1, %xmm1
0000000000cb3efd	ucomisd	%xmm1, %xmm0
0000000000cb3f01	jae	0xcb3ea0
0000000000cb3f03	movsd	-0x48(%rbp), %xmm0
0000000000cb3f08	divsd	-0x78(%rbp), %xmm0
0000000000cb3f0d	movsd	(%r12), %xmm1
0000000000cb3f13	leaq	-0x40(%rbp), %rsi
0000000000cb3f17	movq	-0x80(%rbp), %r15
0000000000cb3f1b	movq	%r15, %rdi
0000000000cb3f1e	movq	-0x88(%rbp), %r14
0000000000cb3f25	movq	%r14, %rdx
0000000000cb3f28	movq	-0x90(%rbp), %rbx
0000000000cb3f2f	movq	%rbx, %rcx
0000000000cb3f32	movl	$0x1, %r8d
0000000000cb3f38	callq	__ZN20OZObjectTrackerUtils23generateDirectionalGridERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEERKNS1_IS4_NS6_IS4_EEEER14PCMatrix44TmplIdERKS4_ddb ## OZObjectTrackerUtils::generateDirectionalGrid(std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>&, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>> const&, PCMatrix44Tmpl<double>&, PCVector2<double> const&, double, double, bool)
0000000000cb3f3d	movsd	(%r12), %xmm1
0000000000cb3f43	movsd	0x8(%r12), %xmm2
0000000000cb3f4a	leaq	-0x70(%rbp), %rdi
0000000000cb3f4e	movsd	-0x50(%rbp), %xmm0
0000000000cb3f53	movsd	-0x58(%rbp), %xmm3
0000000000cb3f58	callq	__ZN20OZObjectTrackerUtils31generateHorizontalEllipsePointsEdddd ## OZObjectTrackerUtils::generateHorizontalEllipsePoints(double, double, double, double)
0000000000cb3f5d	movsd	0x8(%r12), %xmm1
0000000000cb3f64	leaq	-0x70(%rbp), %rsi
0000000000cb3f68	movq	%r15, %rdi
0000000000cb3f6b	movq	%r14, %rdx
0000000000cb3f6e	movq	%rbx, %rcx
0000000000cb3f71	movsd	-0x48(%rbp), %xmm0
0000000000cb3f76	xorl	%r8d, %r8d
0000000000cb3f79	callq	__ZN20OZObjectTrackerUtils23generateDirectionalGridERNSt3__16vectorINS0_4pairI9PCVector2IdES4_EENS0_9allocatorIS5_EEEERKNS1_IS4_NS6_IS4_EEEER14PCMatrix44TmplIdERKS4_ddb ## OZObjectTrackerUtils::generateDirectionalGrid(std::__1::vector<std::__1::pair<PCVector2<double>, PCVector2<double>>, std::__1::allocator<std::__1::pair<PCVector2<double>, PCVector2<double>>>>&, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>> const&, PCMatrix44Tmpl<double>&, PCVector2<double> const&, double, double, bool)
0000000000cb3f7e	movq	-0x70(%rbp), %rdi
0000000000cb3f82	testq	%rdi, %rdi
0000000000cb3f85	je	0xcb3f90
0000000000cb3f87	movq	%rdi, -0x68(%rbp)
0000000000cb3f8b	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000cb3f90	movq	-0x40(%rbp), %rdi
0000000000cb3f94	testq	%rdi, %rdi
0000000000cb3f97	je	0xcb3fa2
0000000000cb3f99	movq	%rdi, -0x38(%rbp)
0000000000cb3f9d	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000cb3fa2	addq	$0x98, %rsp
0000000000cb3fa9	popq	%rbx
0000000000cb3faa	popq	%r12
0000000000cb3fac	popq	%r13
0000000000cb3fae	popq	%r14
0000000000cb3fb0	popq	%r15
0000000000cb3fb2	popq	%rbp
0000000000cb3fb3	retq
0000000000cb3fb4	movq	%rax, %rbx
0000000000cb3fb7	movq	-0x70(%rbp), %rdi
0000000000cb3fbb	testq	%rdi, %rdi
0000000000cb3fbe	je	0xcb3fd4
0000000000cb3fc0	movq	%rdi, -0x68(%rbp)
0000000000cb3fc4	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000cb3fc9	jmp	0xcb3fd4
0000000000cb3fcb	jmp	0xcb3fd1
0000000000cb3fcd	jmp	0xcb3fd1
0000000000cb3fcf	jmp	0xcb3fd1
0000000000cb3fd1	movq	%rax, %rbx
0000000000cb3fd4	movq	-0x40(%rbp), %rdi
0000000000cb3fd8	testq	%rdi, %rdi
0000000000cb3fdb	je	0xcb3fe6
0000000000cb3fdd	movq	%rdi, -0x38(%rbp)
0000000000cb3fe1	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000cb3fe6	movq	%rbx, %rdi
0000000000cb3fe9	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000cb3fee	nop
