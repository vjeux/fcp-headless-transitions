__ZN10PCCurveFit18ComputeLeftTangentERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEm:
000000000000b580	pushq	%rbp
000000000000b581	movq	%rsp, %rbp
000000000000b584	movq	(%rdx), %rax
000000000000b587	shlq	$0x4, %rcx
000000000000b58b	movupd	(%rax,%rcx), %xmm1
000000000000b590	movupd	0x10(%rax,%rcx), %xmm0
000000000000b596	subpd	%xmm1, %xmm0
000000000000b59a	movapd	%xmm0, %xmm1
000000000000b59e	mulpd	%xmm0, %xmm1
000000000000b5a2	haddpd	%xmm1, %xmm1
000000000000b5a6	movq	%rdi, %rax
000000000000b5a9	sqrtsd	%xmm1, %xmm1
000000000000b5ad	movapd	0x1170bb(%rip), %xmm2
000000000000b5b5	andpd	%xmm1, %xmm2
000000000000b5b9	movsd	0x11729f(%rip), %xmm3
000000000000b5c1	ucomisd	%xmm2, %xmm3
000000000000b5c5	ja	0xb5cf
000000000000b5c7	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000000b5cb	divpd	%xmm1, %xmm0
000000000000b5cf	movupd	%xmm0, (%rax)
000000000000b5d3	popq	%rbp
000000000000b5d4	retq
000000000000b5d5	nop
