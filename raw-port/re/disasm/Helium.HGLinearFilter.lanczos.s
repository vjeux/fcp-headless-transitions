__ZN14HGLinearFilter7lanczosEfff:
000000000010f280	movaps	%xmm0, %xmm4
000000000010f283	movaps	0x2b89a6(%rip), %xmm0
000000000010f28a	andps	%xmm4, %xmm0
000000000010f28d	xorps	%xmm2, %xmm2
000000000010f290	ucomiss	%xmm0, %xmm1
000000000010f293	jbe	0x10f33b
000000000010f299	pushq	%rbp
000000000010f29a	movq	%rsp, %rbp
000000000010f29d	subq	$0x20, %rsp
000000000010f2a1	movss	0x2c30df(%rip), %xmm0
000000000010f2a9	mulss	%xmm4, %xmm0
000000000010f2ad	movaps	%xmm0, %xmm2
000000000010f2b0	mulss	%xmm0, %xmm2
000000000010f2b4	movss	0x2b8a04(%rip), %xmm3
000000000010f2bc	addss	%xmm3, %xmm2
000000000010f2c0	ucomiss	%xmm3, %xmm2
000000000010f2c3	movaps	%xmm3, %xmm2
000000000010f2c6	jne	0x10f2ca
000000000010f2c8	jnp	0x10f2f6
000000000010f2ca	movaps	%xmm4, -0x20(%rbp)
000000000010f2ce	movss	%xmm1, -0x4(%rbp)
000000000010f2d3	movss	%xmm0, -0x8(%rbp)
000000000010f2d8	callq	0x3c55e2                        ## symbol stub for: _sinf
000000000010f2dd	movss	-0x4(%rbp), %xmm1
000000000010f2e2	movss	0x2b89d6(%rip), %xmm3
000000000010f2ea	movaps	-0x20(%rbp), %xmm4
000000000010f2ee	movaps	%xmm0, %xmm2
000000000010f2f1	divss	-0x8(%rbp), %xmm2
000000000010f2f6	divss	%xmm1, %xmm4
000000000010f2fa	mulss	0x2c3086(%rip), %xmm4
000000000010f302	movaps	%xmm4, %xmm0
000000000010f305	mulss	%xmm4, %xmm0
000000000010f309	addss	%xmm3, %xmm0
000000000010f30d	ucomiss	%xmm3, %xmm0
000000000010f310	jne	0x10f314
000000000010f312	jnp	0x10f332
000000000010f314	movaps	%xmm4, %xmm0
000000000010f317	movaps	%xmm4, -0x20(%rbp)
000000000010f31b	movss	%xmm2, -0x4(%rbp)
000000000010f320	callq	0x3c55e2                        ## symbol stub for: _sinf
000000000010f325	movss	-0x4(%rbp), %xmm2
000000000010f32a	movaps	%xmm0, %xmm3
000000000010f32d	divss	-0x20(%rbp), %xmm3
000000000010f332	mulss	%xmm3, %xmm2
000000000010f336	addq	$0x20, %rsp
000000000010f33a	popq	%rbp
000000000010f33b	movaps	%xmm2, %xmm0
000000000010f33e	retq
000000000010f33f	nop
