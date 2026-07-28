__ZN17HgcScreeningMatte12SetParameterEiffff:
000000000146d3c0	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000146d3c5	testl	%esi, %esi
000000000146d3c7	je	0x146d3ca
000000000146d3c9	retq
000000000146d3ca	movq	0x198(%rdi), %rax
000000000146d3d1	movss	(%rax), %xmm4
000000000146d3d5	ucomiss	%xmm0, %xmm4
000000000146d3d8	jne	0x146d403
000000000146d3da	jp	0x146d403
000000000146d3dc	movss	0x4(%rax), %xmm4
000000000146d3e1	ucomiss	%xmm0, %xmm4
000000000146d3e4	jne	0x146d403
000000000146d3e6	jp	0x146d403
000000000146d3e8	movss	0x8(%rax), %xmm4
000000000146d3ed	ucomiss	%xmm0, %xmm4
000000000146d3f0	jne	0x146d403
000000000146d3f2	jp	0x146d403
000000000146d3f4	movss	0xc(%rax), %xmm4
000000000146d3f9	xorps	%xmm5, %xmm5
000000000146d3fc	ucomiss	%xmm5, %xmm4
000000000146d3ff	jne	0x146d403
000000000146d401	jnp	0x146d457
000000000146d403	pushq	%rbp
000000000146d404	movq	%rsp, %rbp
000000000146d407	movss	%xmm0, 0x10(%rax)
000000000146d40c	movss	%xmm0, (%rax)
000000000146d410	movss	%xmm0, 0x14(%rax)
000000000146d415	movss	%xmm0, 0x4(%rax)
000000000146d41a	movss	%xmm0, 0x18(%rax)
000000000146d41f	movss	%xmm0, 0x8(%rax)
000000000146d424	movl	$0x0, 0x1c(%rax)
000000000146d42b	movl	$0x0, 0xc(%rax)
000000000146d432	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000146d438	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
000000000146d43e	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
000000000146d444	movaps	%xmm0, 0xe0(%rax)
000000000146d44b	callq	0x1496bfa                       ## symbol stub for: __ZN6HGNode9ClearBitsEv
000000000146d450	movl	$0x1, %eax
000000000146d455	popq	%rbp
000000000146d456	retq
000000000146d457	xorl	%eax, %eax
000000000146d459	retq
000000000146d45a	nopw	(%rax,%rax)
