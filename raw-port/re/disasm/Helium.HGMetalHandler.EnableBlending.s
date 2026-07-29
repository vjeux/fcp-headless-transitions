__ZN14HGMetalHandler14EnableBlendingEi:
000000000015dc20	pushq	%rbp
000000000015dc21	movq	%rsp, %rbp
000000000015dc24	movl	%esi, %ecx
000000000015dc26	movl	$0x1, %eax
000000000015dc2b	shll	%cl, %eax
000000000015dc2d	movzbl	0x5c8(%rdi), %edx
000000000015dc34	btl	%esi, %edx
000000000015dc37	jae	0x15dc3b
000000000015dc39	popq	%rbp
000000000015dc3a	retq
000000000015dc3b	orb	%dl, %al
000000000015dc3d	movb	%al, 0x5c8(%rdi)
000000000015dc43	movb	$0x1, 0x708(%rdi)
000000000015dc4a	popq	%rbp
000000000015dc4b	retq
000000000015dc4c	nopl	(%rax)
