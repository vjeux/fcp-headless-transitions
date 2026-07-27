_HGRectExcludesRect:
0000000000107ba0	pushq	%rbp
0000000000107ba1	movq	%rsp, %rbp
0000000000107ba4	movq	%rdi, %rax
0000000000107ba7	shrq	$0x20, %rax
0000000000107bab	cmpl	%ecx, %edi
0000000000107bad	setg	%dil
0000000000107bb1	shrq	$0x20, %rcx
0000000000107bb5	cmpl	%ecx, %eax
0000000000107bb7	setg	%al
0000000000107bba	cmpl	%edx, %esi
0000000000107bbc	setl	%cl
0000000000107bbf	orb	%dil, %cl
0000000000107bc2	orb	%al, %cl
0000000000107bc4	shrq	$0x20, %rdx
0000000000107bc8	shrq	$0x20, %rsi
0000000000107bcc	cmpl	%edx, %esi
0000000000107bce	setl	%al
0000000000107bd1	orb	%cl, %al
0000000000107bd3	movzbl	%al, %eax
0000000000107bd6	popq	%rbp
0000000000107bd7	retq
0000000000107bd8	nopl	(%rax,%rax)
