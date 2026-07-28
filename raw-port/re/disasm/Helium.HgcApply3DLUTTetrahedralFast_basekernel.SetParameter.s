__ZN39HgcApply3DLUTTetrahedralFast_basekernel12SetParameterEiffff:
000000000038c090	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000038c095	cmpl	$0x3, %esi
000000000038c098	ja	0x38c103
000000000038c09a	movq	0x198(%rdi), %rcx
000000000038c0a1	movl	%esi, %edx
000000000038c0a3	shlq	$0x5, %rdx
000000000038c0a7	leaq	(%rcx,%rdx), %rax
000000000038c0ab	movss	(%rcx,%rdx), %xmm4
000000000038c0b0	ucomiss	%xmm0, %xmm4
000000000038c0b3	jne	0x38c0db
000000000038c0b5	jp	0x38c0db
000000000038c0b7	movss	0x4(%rax), %xmm4
000000000038c0bc	ucomiss	%xmm1, %xmm4
000000000038c0bf	jne	0x38c0db
000000000038c0c1	jp	0x38c0db
000000000038c0c3	movss	0x8(%rax), %xmm4
000000000038c0c8	ucomiss	%xmm2, %xmm4
000000000038c0cb	jne	0x38c0db
000000000038c0cd	jp	0x38c0db
000000000038c0cf	movss	0xc(%rax), %xmm4
000000000038c0d4	ucomiss	%xmm3, %xmm4
000000000038c0d7	jne	0x38c0db
000000000038c0d9	jnp	0x38c104
000000000038c0db	pushq	%rbp
000000000038c0dc	movq	%rsp, %rbp
000000000038c0df	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000038c0e5	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
000000000038c0eb	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
000000000038c0f1	movups	%xmm0, 0x10(%rax)
000000000038c0f5	movups	%xmm0, (%rax)
000000000038c0f8	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
000000000038c0fd	movl	$0x1, %eax
000000000038c102	popq	%rbp
000000000038c103	retq
000000000038c104	xorl	%eax, %eax
000000000038c106	retq
000000000038c107	nopw	(%rax,%rax)
