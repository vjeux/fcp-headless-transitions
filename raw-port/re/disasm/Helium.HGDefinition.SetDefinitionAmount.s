__ZN12HGDefinition19SetDefinitionAmountEf:
0000000000106de0	pushq	%rbp
0000000000106de1	movq	%rsp, %rbp
0000000000106de4	movss	%xmm0, 0x1bc(%rdi)
0000000000106dec	movq	0x1b0(%rdi), %rdi
0000000000106df3	movq	(%rdi), %rax
0000000000106df6	movq	0x60(%rax), %rax
0000000000106dfa	xorl	%esi, %esi
0000000000106dfc	movaps	%xmm0, %xmm1
0000000000106dff	movaps	%xmm0, %xmm2
0000000000106e02	movaps	%xmm0, %xmm3
0000000000106e05	popq	%rbp
0000000000106e06	jmpq	*%rax
0000000000106e08	nopl	(%rax,%rax)
