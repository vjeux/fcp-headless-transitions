__ZN24FFAudioGainChannelBufferC1E6CMTimeyb:
0000000000e60850	pushq	%rbp
0000000000e60851	movq	%rsp, %rbp
0000000000e60854	pushq	%r15
0000000000e60856	pushq	%r14
0000000000e60858	pushq	%rbx
0000000000e60859	pushq	%rax
0000000000e6085a	leaq	0xab765f(%rip), %rax
0000000000e60861	movq	%rax, (%rdi)
0000000000e60864	xorps	%xmm0, %xmm0
0000000000e60867	movups	%xmm0, 0x8(%rdi)
0000000000e6086b	movq	$0x0, 0x18(%rdi)
0000000000e60873	movaps	0x10(%rbp), %xmm0
0000000000e60877	movups	%xmm0, 0x20(%rdi)
0000000000e6087b	movq	0x20(%rbp), %rax
0000000000e6087f	movq	%rax, 0x30(%rdi)
0000000000e60883	movb	%dl, 0x38(%rdi)
0000000000e60886	testq	%rsi, %rsi
0000000000e60889	je	0xe608bb
0000000000e6088b	movq	%rsi, %r14
0000000000e6088e	movq	%rdi, %rbx
0000000000e60891	leaq	0x8(%rdi), %r15
0000000000e60895	movq	%rsi, %rax
0000000000e60898	shrq	$0x3e, %rax
0000000000e6089c	jne	0xe608c6
0000000000e6089e	leaq	(,%r14,4), %rdi
0000000000e608a6	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000e608ab	leaq	(%rax,%r14,4), %rcx
0000000000e608af	movq	%rax, 0x8(%rbx)
0000000000e608b3	movq	%rax, 0x10(%rbx)
0000000000e608b7	movq	%rcx, 0x18(%rbx)
0000000000e608bb	addq	$0x8, %rsp
0000000000e608bf	popq	%rbx
0000000000e608c0	popq	%r14
0000000000e608c2	popq	%r15
0000000000e608c4	popq	%rbp
0000000000e608c5	retq
0000000000e608c6	callq	__ZNSt3__16vectorIfNS_9allocatorIfEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<float, std::__1::allocator<float>>::__throw_length_error[abi:nqe210106]()
0000000000e608cb	ud2
0000000000e608cd	movq	%rax, %r14
0000000000e608d0	movq	(%r15), %rdi
0000000000e608d3	testq	%rdi, %rdi
0000000000e608d6	je	0xe608e1
0000000000e608d8	movq	%rdi, 0x10(%rbx)
0000000000e608dc	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000e608e1	movq	%r14, %rdi
0000000000e608e4	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000e608e9	nopl	(%rax)
