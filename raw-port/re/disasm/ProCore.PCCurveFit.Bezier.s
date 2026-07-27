__ZN10PCCurveFit6BezierEiRNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEd:
000000000000c766	pushq	%rbp
000000000000c767	movq	%rsp, %rbp
000000000000c76a	pushq	%r15
000000000000c76c	pushq	%r14
000000000000c76e	pushq	%rbx
000000000000c76f	subq	$0x38, %rsp
000000000000c773	movapd	%xmm0, -0x30(%rbp)
000000000000c778	movl	%edx, %r14d
000000000000c77b	movq	%rdi, %rbx
000000000000c77e	xorpd	%xmm0, %xmm0
000000000000c782	leaq	-0x50(%rbp), %r15
000000000000c786	movapd	%xmm0, (%r15)
000000000000c78b	movq	$0x0, 0x10(%r15)
000000000000c793	movq	(%rcx), %rsi
000000000000c796	movq	0x8(%rcx), %rdx
000000000000c79a	movq	%rdx, %rcx
000000000000c79d	subq	%rsi, %rcx
000000000000c7a0	sarq	$0x4, %rcx
000000000000c7a4	movq	%r15, %rdi
000000000000c7a7	callq	__ZNSt3__16vectorI9PCVector2IdENS_9allocatorIS2_EEE16__init_with_sizeB9nqe210106IPS2_S7_EEvT_T0_m ## void std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>::__init_with_size[abi:nqe210106]<PCVector2<double>*, PCVector2<double>*>(PCVector2<double>*, PCVector2<double>*, unsigned long)
000000000000c7ac	movq	(%r15), %rdi
000000000000c7af	testl	%r14d, %r14d
000000000000c7b2	jle	0xc820
000000000000c7b4	movsd	0x115d74(%rip), %xmm0
000000000000c7bc	movapd	-0x30(%rbp), %xmm1
000000000000c7c1	subsd	%xmm1, %xmm0
000000000000c7c5	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000000c7c9	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000000c7cd	leal	-0x1(%r14), %eax
000000000000c7d1	movl	$0x1, %ecx
000000000000c7d6	testl	%eax, %eax
000000000000c7d8	movl	$0x0, %edx
000000000000c7dd	cmovgl	%eax, %edx
000000000000c7e0	shlq	$0x4, %rdx
000000000000c7e4	addq	$0x10, %rdx
000000000000c7e8	movupd	(%rdi), %xmm2
000000000000c7ec	xorl	%esi, %esi
000000000000c7ee	mulpd	%xmm0, %xmm2
000000000000c7f2	movupd	0x10(%rdi,%rsi), %xmm3
000000000000c7f8	movapd	%xmm1, %xmm4
000000000000c7fc	mulpd	%xmm3, %xmm4
000000000000c800	addpd	%xmm2, %xmm4
000000000000c804	movupd	%xmm4, (%rdi,%rsi)
000000000000c809	addq	$0x10, %rsi
000000000000c80d	movapd	%xmm3, %xmm2
000000000000c811	cmpq	%rsi, %rdx
000000000000c814	jne	0xc7ee
000000000000c816	decl	%eax
000000000000c818	cmpl	%r14d, %ecx
000000000000c81b	leal	0x1(%rcx), %ecx
000000000000c81e	jne	0xc7d6
000000000000c820	movups	(%rdi), %xmm0
000000000000c823	movups	%xmm0, (%rbx)
000000000000c826	movq	%rdi, -0x48(%rbp)
000000000000c82a	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000000c82f	movq	%rbx, %rax
000000000000c832	addq	$0x38, %rsp
000000000000c836	popq	%rbx
000000000000c837	popq	%r14
000000000000c839	popq	%r15
000000000000c83b	popq	%rbp
000000000000c83c	retq
000000000000c83d	nop
