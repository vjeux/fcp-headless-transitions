__ZN44HgcBilateralFilterInterpSC_InterpolatorLastX12SetParameterEiffff:
000000000031cff0	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000031cff5	testl	%esi, %esi
000000000031cff7	je	0x31cffa
000000000031cff9	retq
000000000031cffa	movq	0x198(%rdi), %rax
000000000031d001	movss	(%rax), %xmm4
000000000031d005	ucomiss	%xmm0, %xmm4
000000000031d008	jne	0x31d030
000000000031d00a	jp	0x31d030
000000000031d00c	movss	0x4(%rax), %xmm4
000000000031d011	ucomiss	%xmm1, %xmm4
000000000031d014	jne	0x31d030
000000000031d016	jp	0x31d030
000000000031d018	movss	0x8(%rax), %xmm4
000000000031d01d	ucomiss	%xmm2, %xmm4
000000000031d020	jne	0x31d030
000000000031d022	jp	0x31d030
000000000031d024	movss	0xc(%rax), %xmm4
000000000031d029	ucomiss	%xmm3, %xmm4
000000000031d02c	jne	0x31d030
000000000031d02e	jnp	0x31d059
000000000031d030	pushq	%rbp
000000000031d031	movq	%rsp, %rbp
000000000031d034	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000031d03a	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
000000000031d040	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
000000000031d046	movups	%xmm0, 0x10(%rax)
000000000031d04a	movups	%xmm0, (%rax)
000000000031d04d	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
000000000031d052	movl	$0x1, %eax
000000000031d057	popq	%rbp
000000000031d058	retq
000000000031d059	xorl	%eax, %eax
000000000031d05b	retq
000000000031d05c	nopl	(%rax)
