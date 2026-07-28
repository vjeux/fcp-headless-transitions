__ZN34HGInterlaceHandler_InterlaceFields13SetFieldOrderENS_34hgInterlaceHandler_InterlaceFieldsE:
0000000000093280	pushq	%rbp
0000000000093281	movq	%rsp, %rbp
0000000000093284	movl	%esi, %eax
0000000000093286	cvtsi2ss	%rax, %xmm0
000000000009328b	movq	(%rdi), %rax
000000000009328e	movq	0x60(%rax), %rax
0000000000093292	xorps	%xmm1, %xmm1
0000000000093295	xorps	%xmm2, %xmm2
0000000000093298	xorps	%xmm3, %xmm3
000000000009329b	xorl	%esi, %esi
000000000009329d	popq	%rbp
000000000009329e	jmpq	*%rax
