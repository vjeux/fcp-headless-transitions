_HGRectIsEqualSize:
0000000000107aa0	pushq	%rbp
0000000000107aa1	movq	%rsp, %rbp
0000000000107aa4	movl	%esi, %r8d
0000000000107aa7	subl	%edi, %r8d
0000000000107aaa	movl	%ecx, %r9d
0000000000107aad	subl	%edx, %r9d
0000000000107ab0	xorl	%eax, %eax
0000000000107ab2	cmpl	%r9d, %r8d
0000000000107ab5	jne	0x107ad2
0000000000107ab7	shrq	$0x20, %rsi
0000000000107abb	shrq	$0x20, %rdi
0000000000107abf	shrq	$0x20, %rcx
0000000000107ac3	shrq	$0x20, %rdx
0000000000107ac7	subl	%edi, %esi
0000000000107ac9	subl	%edx, %ecx
0000000000107acb	xorl	%eax, %eax
0000000000107acd	cmpl	%ecx, %esi
0000000000107acf	sete	%al
0000000000107ad2	popq	%rbp
0000000000107ad3	retq
0000000000107ad4	nopw	%cs:(%rax,%rax)
