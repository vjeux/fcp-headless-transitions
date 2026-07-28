__ZN20OZObjectTrackerUtils31generateHorizontalEllipsePointsEdddd:
0000000000cb4b70	pushq	%rbp
0000000000cb4b71	movq	%rsp, %rbp
0000000000cb4b74	pushq	%r15
0000000000cb4b76	pushq	%r14
0000000000cb4b78	pushq	%r13
0000000000cb4b7a	pushq	%r12
0000000000cb4b7c	pushq	%rbx
0000000000cb4b7d	subq	$0x48, %rsp
0000000000cb4b81	movsd	%xmm3, -0x60(%rbp)
0000000000cb4b86	movsd	%xmm2, -0x58(%rbp)
0000000000cb4b8b	movsd	%xmm1, -0x50(%rbp)
0000000000cb4b90	movsd	%xmm0, -0x48(%rbp)
0000000000cb4b95	movq	%rdi, %rbx
0000000000cb4b98	xorps	%xmm0, %xmm0
0000000000cb4b9b	movups	%xmm0, (%rdi)
0000000000cb4b9e	movq	$0x0, 0x10(%rdi)
0000000000cb4ba6	movsd	0x8bb14a(%rip), %xmm0
0000000000cb4bae	leaq	-0x40(%rbp), %r14
0000000000cb4bb2	leaq	-0x38(%rbp), %r15
0000000000cb4bb6	movabsq	$-0x8000000000000000, %r13      ## imm = 0x8000000000000000
0000000000cb4bc0	leaq	-0x70(%rbp), %r12
0000000000cb4bc4	nopw	%cs:(%rax,%rax)
0000000000cb4bd0	movsd	%xmm0, -0x30(%rbp)
0000000000cb4bd5	movsd	-0x50(%rbp), %xmm1
0000000000cb4bda	movsd	-0x58(%rbp), %xmm2
0000000000cb4bdf	movsd	-0x60(%rbp), %xmm3
0000000000cb4be4	movq	%r14, %rdi
0000000000cb4be7	movq	%r15, %rsi
0000000000cb4bea	callq	0x1495fdc                       ## symbol stub for: __ZN11PCAlgorithm12superEllipseEddddRdS0_
0000000000cb4bef	movsd	-0x40(%rbp), %xmm0
0000000000cb4bf4	movsd	%xmm0, -0x70(%rbp)
0000000000cb4bf9	movq	-0x38(%rbp), %rax
0000000000cb4bfd	xorq	%r13, %rax
0000000000cb4c00	movq	%rax, -0x68(%rbp)
0000000000cb4c04	movq	%rbx, %rdi
0000000000cb4c07	movq	%r12, %rsi
0000000000cb4c0a	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::push_back[abi:nqe210106](PCVector2<double> const&)
0000000000cb4c0f	movsd	-0x30(%rbp), %xmm0
0000000000cb4c14	addsd	-0x48(%rbp), %xmm0
0000000000cb4c19	xorpd	%xmm1, %xmm1
0000000000cb4c1d	ucomisd	%xmm0, %xmm1
0000000000cb4c21	ja	0xcb4bd0
0000000000cb4c23	xorpd	%xmm0, %xmm0
0000000000cb4c27	leaq	-0x40(%rbp), %r14
0000000000cb4c2b	leaq	-0x38(%rbp), %r15
0000000000cb4c2f	leaq	-0x70(%rbp), %r12
0000000000cb4c33	nopw	%cs:(%rax,%rax)
0000000000cb4c40	movsd	%xmm0, -0x30(%rbp)
0000000000cb4c45	movsd	-0x50(%rbp), %xmm1
0000000000cb4c4a	movsd	-0x58(%rbp), %xmm2
0000000000cb4c4f	movsd	-0x60(%rbp), %xmm3
0000000000cb4c54	movq	%r14, %rdi
0000000000cb4c57	movq	%r15, %rsi
0000000000cb4c5a	callq	0x1495fdc                       ## symbol stub for: __ZN11PCAlgorithm12superEllipseEddddRdS0_
0000000000cb4c5f	movsd	-0x40(%rbp), %xmm0
0000000000cb4c64	movsd	-0x38(%rbp), %xmm1
0000000000cb4c69	movsd	%xmm0, -0x70(%rbp)
0000000000cb4c6e	movsd	%xmm1, -0x68(%rbp)
0000000000cb4c73	movq	%rbx, %rdi
0000000000cb4c76	movq	%r12, %rsi
0000000000cb4c79	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::push_back[abi:nqe210106](PCVector2<double> const&)
0000000000cb4c7e	movsd	-0x30(%rbp), %xmm0
0000000000cb4c83	addsd	-0x48(%rbp), %xmm0
0000000000cb4c88	movsd	0x8bb078(%rip), %xmm1
0000000000cb4c90	ucomisd	%xmm0, %xmm1
0000000000cb4c94	jae	0xcb4c40
0000000000cb4c96	movq	%rbx, %rax
0000000000cb4c99	addq	$0x48, %rsp
0000000000cb4c9d	popq	%rbx
0000000000cb4c9e	popq	%r12
0000000000cb4ca0	popq	%r13
0000000000cb4ca2	popq	%r14
0000000000cb4ca4	popq	%r15
0000000000cb4ca6	popq	%rbp
0000000000cb4ca7	retq
0000000000cb4ca8	jmp	0xcb4cae
0000000000cb4caa	jmp	0xcb4cae
0000000000cb4cac	jmp	0xcb4cae
0000000000cb4cae	movq	%rax, %r14
0000000000cb4cb1	movq	(%rbx), %rdi
0000000000cb4cb4	testq	%rdi, %rdi
0000000000cb4cb7	je	0xcb4cc2
0000000000cb4cb9	movq	%rdi, 0x8(%rbx)
0000000000cb4cbd	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000cb4cc2	movq	%r14, %rdi
0000000000cb4cc5	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000cb4cca	nopw	(%rax,%rax)
