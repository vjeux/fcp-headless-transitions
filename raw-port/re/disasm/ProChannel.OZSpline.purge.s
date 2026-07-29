__ZN8OZSpline5purgeEv:
000000000003d68c	pushq	%rbp
000000000003d68d	movq	%rsp, %rbp
000000000003d690	pushq	%r15
000000000003d692	pushq	%r14
000000000003d694	pushq	%rbx
000000000003d695	subq	$0x68, %rsp
000000000003d699	movq	%rdi, %rbx
000000000003d69c	movq	0x8ce1d(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
000000000003d6a3	movq	0x10(%rax), %rcx
000000000003d6a7	movq	%rcx, -0x40(%rbp)
000000000003d6ab	movups	(%rax), %xmm0
000000000003d6ae	movaps	%xmm0, -0x50(%rbp)
000000000003d6b2	movq	0x28(%rdi), %r14
000000000003d6b6	xorps	%xmm0, %xmm0
000000000003d6b9	movaps	%xmm0, -0x30(%rbp)
000000000003d6bd	movq	$0x0, -0x20(%rbp)
000000000003d6c5	movq	0xa0(%rdi), %rax
000000000003d6cc	testq	%rax, %rax
000000000003d6cf	je	0x3d6da
000000000003d6d1	movq	0x30(%rax), %rdi
000000000003d6d5	testq	%rdi, %rdi
000000000003d6d8	jne	0x3d6de
000000000003d6da	leaq	0x8(%rbx), %rdi
000000000003d6de	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000003d6e3	cmpq	%r14, 0x30(%rbx)
000000000003d6e7	je	0x3d74c
000000000003d6e9	leaq	-0x30(%rbp), %r15
000000000003d6ed	movq	(%r14), %rax
000000000003d6f0	movq	0x20(%rax), %rcx
000000000003d6f4	movq	%rcx, 0x28(%rsp)
000000000003d6f9	movups	0x10(%rax), %xmm0
000000000003d6fd	movups	%xmm0, 0x18(%rsp)
000000000003d702	movq	-0x40(%rbp), %rax
000000000003d706	movq	%rax, 0x10(%rsp)
000000000003d70b	movaps	-0x50(%rbp), %xmm0
000000000003d70f	movups	%xmm0, (%rsp)
000000000003d713	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003d718	testl	%eax, %eax
000000000003d71a	je	0x3d731
000000000003d71c	movq	(%r14), %rax
000000000003d71f	movq	0x20(%rax), %rcx
000000000003d723	movq	%rcx, -0x40(%rbp)
000000000003d727	movups	0x10(%rax), %xmm0
000000000003d72b	movaps	%xmm0, -0x50(%rbp)
000000000003d72f	jmp	0x3d742
000000000003d731	cmpq	0x28(%rbx), %r14
000000000003d735	je	0x3d71c
000000000003d737	movq	%r15, %rdi
000000000003d73a	movq	%r14, %rsi
000000000003d73d	callq	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_ ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::push_back[abi:nqe210106](OZVertex* const&)
000000000003d742	addq	$0x8, %r14
000000000003d746	cmpq	0x30(%rbx), %r14
000000000003d74a	jne	0x3d6ed
000000000003d74c	movq	0xa0(%rbx), %rax
000000000003d753	testq	%rax, %rax
000000000003d756	je	0x3d761
000000000003d758	movq	0x30(%rax), %rdi
000000000003d75c	testq	%rdi, %rdi
000000000003d75f	jne	0x3d765
000000000003d761	leaq	0x8(%rbx), %rdi
000000000003d765	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003d76a	movq	-0x30(%rbp), %rdi
000000000003d76e	cmpq	%rdi, -0x28(%rbp)
000000000003d772	je	0x3d7af
000000000003d774	movl	$0x1, %r15d
000000000003d77a	xorl	%eax, %eax
000000000003d77c	movq	0x8cd3d(%rip), %r14             ## literal pool symbol address: _kCMTimeZero
000000000003d783	movq	(%rdi,%rax,8), %rsi
000000000003d787	movq	(%rbx), %rax
000000000003d78a	movq	%rbx, %rdi
000000000003d78d	xorl	%edx, %edx
000000000003d78f	movq	%r14, %rcx
000000000003d792	callq	*0x20(%rax)
000000000003d795	movl	%r15d, %eax
000000000003d798	movq	-0x30(%rbp), %rdi
000000000003d79c	movq	-0x28(%rbp), %rcx
000000000003d7a0	subq	%rdi, %rcx
000000000003d7a3	sarq	$0x3, %rcx
000000000003d7a7	incl	%r15d
000000000003d7aa	cmpq	%rax, %rcx
000000000003d7ad	ja	0x3d783
000000000003d7af	testq	%rdi, %rdi
000000000003d7b2	je	0x3d7bd
000000000003d7b4	movq	%rdi, -0x28(%rbp)
000000000003d7b8	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003d7bd	addq	$0x68, %rsp
000000000003d7c1	popq	%rbx
000000000003d7c2	popq	%r14
000000000003d7c4	popq	%r15
000000000003d7c6	popq	%rbp
000000000003d7c7	retq
000000000003d7c8	jmp	0x3d7ce
000000000003d7ca	jmp	0x3d7ce
000000000003d7cc	jmp	0x3d7ce
000000000003d7ce	movq	%rax, %rbx
000000000003d7d1	movq	-0x30(%rbp), %rdi
000000000003d7d5	testq	%rdi, %rdi
000000000003d7d8	je	0x3d7e3
000000000003d7da	movq	%rdi, -0x28(%rbp)
000000000003d7de	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000003d7e3	movq	%rbx, %rdi
000000000003d7e6	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000003d7eb	nop
