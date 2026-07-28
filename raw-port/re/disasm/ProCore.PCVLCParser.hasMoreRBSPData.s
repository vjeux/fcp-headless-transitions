__ZNK11PCVLCParser15hasMoreRBSPDataEv:
000000000009df14	movl	0x20(%rdi), %ecx
000000000009df17	movl	0x40(%rdi), %eax
000000000009df1a	leaq	0x20(%rcx), %rdx
000000000009df1e	cmpq	%rax, %rdx
000000000009df21	jbe	0x9df51
000000000009df23	subl	%eax, %ecx
000000000009df25	leal	0x20(%rcx), %edx
000000000009df28	movb	$0x1, %al
000000000009df2a	cmpl	$0x8, %edx
000000000009df2d	jg	0x9df50
000000000009df2f	pushq	%rbp
000000000009df30	movq	%rsp, %rbp
000000000009df33	movq	0x38(%rdi), %rax
000000000009df37	movzbl	-0x1(%rax), %eax
000000000009df3b	bsfl	%eax, %eax
000000000009df3e	xorb	$0x7, %al
000000000009df40	movzbl	%al, %eax
000000000009df43	movl	$0xffffffe8, %edx               ## imm = 0xFFFFFFE8
000000000009df48	subl	%ecx, %edx
000000000009df4a	cmpl	%eax, %edx
000000000009df4c	setne	%al
000000000009df4f	popq	%rbp
000000000009df50	retq
000000000009df51	xorl	%eax, %eax
000000000009df53	retq
