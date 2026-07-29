__ZN8OZSpline16warpSplineLinearEdRK6CMTimeS2_:
000000000003c978	pushq	%rbp
000000000003c979	movq	%rsp, %rbp
000000000003c97c	pushq	%r15
000000000003c97e	pushq	%r14
000000000003c980	pushq	%r13
000000000003c982	pushq	%r12
000000000003c984	pushq	%rbx
000000000003c985	subq	$0xb8, %rsp
000000000003c98c	movsd	%xmm0, -0x38(%rbp)
000000000003c991	movq	0x28(%rdi), %r13
000000000003c995	movq	0x8db24(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
000000000003c99c	movq	0x10(%rax), %rcx
000000000003c9a0	movq	%rcx, -0x50(%rbp)
000000000003c9a4	movups	(%rax), %xmm0
000000000003c9a7	movaps	%xmm0, -0x60(%rbp)
000000000003c9ab	xorl	%eax, %eax
000000000003c9ad	movq	%rax, -0x30(%rbp)
000000000003c9b1	movq	%rax, -0x40(%rbp)
000000000003c9b5	cmpq	%r13, 0x30(%rdi)
000000000003c9b9	je	0x3cacf
000000000003c9bf	movq	%rdx, %rbx
000000000003c9c2	movq	%rsi, %r14
000000000003c9c5	movq	%rdi, -0x48(%rbp)
000000000003c9c9	movq	(%r13), %rdi
000000000003c9cd	movups	0x10(%rdi), %xmm0
000000000003c9d1	movq	0x20(%rdi), %rax
000000000003c9d5	movq	%rax, -0x50(%rbp)
000000000003c9d9	movaps	%xmm0, -0x60(%rbp)
000000000003c9dd	movq	(%rdi), %rax
000000000003c9e0	leaq	-0x30(%rbp), %r12
000000000003c9e4	movq	%r12, %rsi
000000000003c9e7	movq	%r14, %r15
000000000003c9ea	leaq	-0x40(%rbp), %r14
000000000003c9ee	movq	%r14, %rdx
000000000003c9f1	movq	%rbx, %rcx
000000000003c9f4	callq	*0x38(%rax)
000000000003c9f7	movsd	-0x30(%rbp), %xmm0
000000000003c9fc	mulsd	-0x38(%rbp), %xmm0
000000000003ca01	movsd	%xmm0, -0x30(%rbp)
000000000003ca06	movq	(%r13), %rdi
000000000003ca0a	movsd	-0x40(%rbp), %xmm1
000000000003ca0f	movq	(%rdi), %rax
000000000003ca12	movq	%rbx, %rsi
000000000003ca15	callq	*0x48(%rax)
000000000003ca18	movq	(%r13), %rdi
000000000003ca1c	movq	(%rdi), %rax
000000000003ca1f	movq	%r12, %rsi
000000000003ca22	movq	%r14, %rdx
000000000003ca25	movq	%r15, %r14
000000000003ca28	movq	%rbx, %rcx
000000000003ca2b	callq	*0x40(%rax)
000000000003ca2e	movsd	-0x30(%rbp), %xmm0
000000000003ca33	mulsd	-0x38(%rbp), %xmm0
000000000003ca38	movsd	%xmm0, -0x30(%rbp)
000000000003ca3d	movq	(%r13), %rdi
000000000003ca41	movsd	-0x40(%rbp), %xmm1
000000000003ca46	movq	(%rdi), %rax
000000000003ca49	movq	%rbx, %rsi
000000000003ca4c	callq	*0x50(%rax)
000000000003ca4f	movq	(%r13), %r12
000000000003ca53	leaq	-0x98(%rbp), %rdi
000000000003ca5a	leaq	-0x60(%rbp), %rsi
000000000003ca5e	movsd	-0x38(%rbp), %xmm0
000000000003ca63	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
000000000003ca68	movq	0x10(%r15), %rax
000000000003ca6c	movq	%rax, -0x70(%rbp)
000000000003ca70	movups	(%r15), %xmm0
000000000003ca74	movaps	%xmm0, -0x80(%rbp)
000000000003ca78	movq	-0x70(%rbp), %rax
000000000003ca7c	movq	%rax, 0x28(%rsp)
000000000003ca81	movaps	-0x80(%rbp), %xmm0
000000000003ca85	movups	%xmm0, 0x18(%rsp)
000000000003ca8a	movq	-0x88(%rbp), %rax
000000000003ca91	movq	%rax, 0x10(%rsp)
000000000003ca96	movups	-0x98(%rbp), %xmm0
000000000003ca9d	movups	%xmm0, (%rsp)
000000000003caa1	leaq	-0xb0(%rbp), %r15
000000000003caa8	movq	%r15, %rdi
000000000003caab	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000003cab0	movq	(%r12), %rax
000000000003cab4	movq	%r12, %rdi
000000000003cab7	movq	%r15, %rsi
000000000003caba	callq	*0x10(%rax)
000000000003cabd	movq	-0x48(%rbp), %rdi
000000000003cac1	addq	$0x8, %r13
000000000003cac5	cmpq	0x30(%rdi), %r13
000000000003cac9	jne	0x3c9c9
000000000003cacf	addq	$0xb8, %rsp
000000000003cad6	popq	%rbx
000000000003cad7	popq	%r12
000000000003cad9	popq	%r13
000000000003cadb	popq	%r14
000000000003cadd	popq	%r15
000000000003cadf	popq	%rbp
000000000003cae0	retq
000000000003cae1	nop
