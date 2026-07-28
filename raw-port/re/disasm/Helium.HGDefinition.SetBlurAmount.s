__ZN12HGDefinition13SetBlurAmountEf:
0000000000106db0	pushq	%rbp
0000000000106db1	movq	%rsp, %rbp
0000000000106db4	mulss	0x2c3534(%rip), %xmm0
0000000000106dbc	movss	%xmm0, 0x1b8(%rdi)
0000000000106dc4	movq	0x1a8(%rdi), %rdi
0000000000106dcb	movq	(%rdi), %rax
0000000000106dce	movq	0x60(%rax), %rax
0000000000106dd2	xorps	%xmm2, %xmm2
0000000000106dd5	xorps	%xmm3, %xmm3
0000000000106dd8	xorl	%esi, %esi
0000000000106dda	movaps	%xmm0, %xmm1
0000000000106ddd	popq	%rbp
0000000000106dde	jmpq	*%rax
