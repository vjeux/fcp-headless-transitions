__ZN10PCCurveFit23ChordLengthParameterizeERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEmm:
000000000000bb42	pushq	%rbp
000000000000bb43	movq	%rsp, %rbp
000000000000bb46	pushq	%r15
000000000000bb48	pushq	%r14
000000000000bb4a	pushq	%r12
000000000000bb4c	pushq	%rbx
000000000000bb4d	movq	%rcx, %rbx
000000000000bb50	movq	%rdx, %r14
000000000000bb53	movq	%rsi, %r15
000000000000bb56	movq	%rcx, %r12
000000000000bb59	subq	%rdx, %r12
000000000000bb5c	leaq	0x8(,%r12,8), %rax
000000000000bb64	movabsq	$0x7fffffff8, %rdi              ## imm = 0x7FFFFFFF8
000000000000bb6e	andq	%rax, %rdi
000000000000bb71	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000bb76	movq	$0x0, (%rax)
000000000000bb7d	leaq	0x1(%r14), %rcx
000000000000bb81	cmpq	%rbx, %rcx
000000000000bb84	ja	0xbbef
000000000000bb86	movsd	(%rax), %xmm0
000000000000bb8a	shlq	$0x4, %r14
000000000000bb8e	addq	(%r15), %r14
000000000000bb91	movl	$0x8, %edx
000000000000bb96	movq	%rcx, %rsi
000000000000bb99	movupd	-0x10(%r14,%rdx,2), %xmm1
000000000000bba0	movupd	(%r14,%rdx,2), %xmm2
000000000000bba6	subpd	%xmm1, %xmm2
000000000000bbaa	mulpd	%xmm2, %xmm2
000000000000bbae	haddpd	%xmm2, %xmm2
000000000000bbb2	xorps	%xmm1, %xmm1
000000000000bbb5	sqrtsd	%xmm2, %xmm1
000000000000bbb9	addsd	%xmm1, %xmm0
000000000000bbbd	movsd	%xmm0, (%rax,%rdx)
000000000000bbc2	incq	%rsi
000000000000bbc5	addq	$0x8, %rdx
000000000000bbc9	cmpq	%rbx, %rsi
000000000000bbcc	jbe	0xbb99
000000000000bbce	movq	%rax, %rdx
000000000000bbd1	addq	$0x8, %rdx
000000000000bbd5	movsd	(%rdx), %xmm0
000000000000bbd9	divsd	(%rax,%r12,8), %xmm0
000000000000bbdf	movsd	%xmm0, (%rdx)
000000000000bbe3	incq	%rcx
000000000000bbe6	addq	$0x8, %rdx
000000000000bbea	cmpq	%rbx, %rcx
000000000000bbed	jbe	0xbbd5
000000000000bbef	popq	%rbx
000000000000bbf0	popq	%r12
000000000000bbf2	popq	%r14
000000000000bbf4	popq	%r15
000000000000bbf6	popq	%rbp
000000000000bbf7	retq
