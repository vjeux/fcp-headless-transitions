__ZN8OZSpline11scaleSplineEdddRK6CMTime:
000000000003d864	pushq	%rbp
000000000003d865	movq	%rsp, %rbp
000000000003d868	pushq	%r15
000000000003d86a	pushq	%r14
000000000003d86c	pushq	%r13
000000000003d86e	pushq	%r12
000000000003d870	pushq	%rbx
000000000003d871	subq	$0x88, %rsp
000000000003d878	movq	%rsi, %r14
000000000003d87b	movapd	%xmm2, -0x80(%rbp)
000000000003d880	movaps	%xmm1, -0x70(%rbp)
000000000003d884	movapd	%xmm0, -0x60(%rbp)
000000000003d889	movq	%rdi, %rbx
000000000003d88c	movq	0xa0(%rdi), %rax
000000000003d893	testq	%rax, %rax
000000000003d896	je	0x3d8a1
000000000003d898	movq	0x30(%rax), %rdi
000000000003d89c	testq	%rdi, %rdi
000000000003d89f	jne	0x3d8a5
000000000003d8a1	leaq	0x8(%rbx), %rdi
000000000003d8a5	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000003d8aa	xorl	%eax, %eax
000000000003d8ac	movq	%rax, -0x38(%rbp)
000000000003d8b0	movq	%rax, -0x30(%rbp)
000000000003d8b4	movq	0x10(%rbx), %rax
000000000003d8b8	cmpq	0x18(%rbx), %rax
000000000003d8bc	je	0x3d9ee
000000000003d8c2	movq	0x28(%rbx), %r13
000000000003d8c6	cmpq	%r13, 0x30(%rbx)
000000000003d8ca	je	0x3d9ee
000000000003d8d0	movddup	-0x60(%rbp), %xmm0              ## xmm0 = mem[0,0]
000000000003d8d5	movapd	%xmm0, -0xb0(%rbp)
000000000003d8dd	movddup	-0x80(%rbp), %xmm0              ## xmm0 = mem[0,0]
000000000003d8e2	movapd	%xmm0, -0xa0(%rbp)
000000000003d8ea	movddup	-0x70(%rbp), %xmm0              ## xmm0 = mem[0,0]
000000000003d8ef	movapd	%xmm0, -0x90(%rbp)
000000000003d8f7	leaq	-0x38(%rbp), %r15
000000000003d8fb	leaq	-0x30(%rbp), %r12
000000000003d8ff	movq	(%r13), %rdi
000000000003d903	movq	(%rdi), %rax
000000000003d906	movq	%r14, %rsi
000000000003d909	callq	*0x18(%rax)
000000000003d90c	movapd	%xmm0, -0x50(%rbp)
000000000003d911	movq	(%r13), %rdi
000000000003d915	movq	(%rdi), %rax
000000000003d918	movq	%r15, %rsi
000000000003d91b	movq	%r15, %rdx
000000000003d91e	movq	%r14, %rcx
000000000003d921	callq	*0x38(%rax)
000000000003d924	movq	(%r13), %rdi
000000000003d928	movq	(%rdi), %rax
000000000003d92b	movq	%r12, %rsi
000000000003d92e	movq	%r12, %rdx
000000000003d931	movq	%r14, %rcx
000000000003d934	callq	*0x40(%rax)
000000000003d937	movsd	-0x38(%rbp), %xmm0
000000000003d93c	movapd	-0x50(%rbp), %xmm3
000000000003d941	addsd	%xmm3, %xmm0
000000000003d945	movsd	-0x30(%rbp), %xmm1
000000000003d94a	addsd	%xmm3, %xmm1
000000000003d94e	mulsd	-0x60(%rbp), %xmm0
000000000003d953	movapd	-0x80(%rbp), %xmm2
000000000003d958	minsd	%xmm0, %xmm2
000000000003d95c	movapd	-0x70(%rbp), %xmm0
000000000003d961	maxsd	%xmm2, %xmm0
000000000003d965	unpcklpd	%xmm3, %xmm1                    ## xmm1 = xmm1[0],xmm3[0]
000000000003d969	mulpd	-0xb0(%rbp), %xmm1
000000000003d971	movapd	-0xa0(%rbp), %xmm2
000000000003d979	minpd	%xmm1, %xmm2
000000000003d97d	movapd	-0x90(%rbp), %xmm1
000000000003d985	maxpd	%xmm2, %xmm1
000000000003d989	movapd	%xmm1, %xmm2
000000000003d98d	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
000000000003d991	movapd	%xmm2, -0x50(%rbp)
000000000003d996	subsd	%xmm2, %xmm0
000000000003d99a	hsubpd	%xmm1, %xmm1
000000000003d99e	movsd	%xmm0, -0x38(%rbp)
000000000003d9a3	movlpd	%xmm1, -0x30(%rbp)
000000000003d9a8	movq	(%r13), %rdi
000000000003d9ac	movq	(%rdi), %rax
000000000003d9af	movapd	%xmm0, %xmm1
000000000003d9b3	movq	%r14, %rsi
000000000003d9b6	callq	*0x48(%rax)
000000000003d9b9	movq	(%r13), %rdi
000000000003d9bd	movsd	-0x30(%rbp), %xmm0
000000000003d9c2	movq	(%rdi), %rax
000000000003d9c5	movaps	%xmm0, %xmm1
000000000003d9c8	movq	%r14, %rsi
000000000003d9cb	callq	*0x50(%rax)
000000000003d9ce	movq	(%r13), %rdi
000000000003d9d2	movq	(%rdi), %rax
000000000003d9d5	movapd	-0x50(%rbp), %xmm0
000000000003d9da	movq	%r14, %rsi
000000000003d9dd	callq	*0x20(%rax)
000000000003d9e0	addq	$0x8, %r13
000000000003d9e4	cmpq	0x30(%rbx), %r13
000000000003d9e8	jne	0x3d8ff
000000000003d9ee	movq	0xa0(%rbx), %rax
000000000003d9f5	testq	%rax, %rax
000000000003d9f8	je	0x3da03
000000000003d9fa	movq	0x30(%rax), %rdi
000000000003d9fe	testq	%rdi, %rdi
000000000003da01	jne	0x3da0a
000000000003da03	addq	$0x8, %rbx
000000000003da07	movq	%rbx, %rdi
000000000003da0a	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003da0f	addq	$0x88, %rsp
000000000003da16	popq	%rbx
000000000003da17	popq	%r12
000000000003da19	popq	%r13
000000000003da1b	popq	%r14
000000000003da1d	popq	%r15
000000000003da1f	popq	%rbp
000000000003da20	retq
000000000003da21	nop
