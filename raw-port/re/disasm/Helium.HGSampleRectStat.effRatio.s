__ZNK16HGSampleRectStat8effRatioEv:
0000000000148ac0	pushq	%rbp
0000000000148ac1	movq	%rsp, %rbp
0000000000148ac4	movl	0x20(%rdi), %eax
0000000000148ac7	movl	0x24(%rdi), %ecx
0000000000148aca	subl	0x18(%rdi), %eax
0000000000148acd	subl	0x1c(%rdi), %ecx
0000000000148ad0	movl	0x34(%rdi), %edx
0000000000148ad3	subl	0x2c(%rdi), %edx
0000000000148ad6	movl	0x38(%rdi), %esi
0000000000148ad9	subl	0x30(%rdi), %esi
0000000000148adc	cvtsi2ss	%eax, %xmm1
0000000000148ae0	cvtsi2ss	%edx, %xmm2
0000000000148ae4	cvtsi2ss	%ecx, %xmm0
0000000000148ae8	cvtsi2ss	%esi, %xmm3
0000000000148aec	divss	%xmm2, %xmm1
0000000000148af0	mulss	%xmm1, %xmm0
0000000000148af4	divss	%xmm3, %xmm0
0000000000148af8	popq	%rbp
0000000000148af9	retq
0000000000148afa	nopw	(%rax,%rax)
