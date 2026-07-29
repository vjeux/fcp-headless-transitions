__ZN14HGMetalHandler15DisableBlendingEi:
000000000015dc70	pushq	%rbp
000000000015dc71	movq	%rsp, %rbp
000000000015dc74	movl	%esi, %ecx
000000000015dc76	movl	$0x1, %eax
000000000015dc7b	shll	%cl, %eax
000000000015dc7d	movzbl	0x5c8(%rdi), %edx
000000000015dc84	btl	%esi, %edx
000000000015dc87	jae	0x15dc9a
000000000015dc89	notb	%al
000000000015dc8b	andb	%dl, %al
000000000015dc8d	movb	%al, 0x5c8(%rdi)
000000000015dc93	movb	$0x1, 0x708(%rdi)
000000000015dc9a	popq	%rbp
000000000015dc9b	retq
000000000015dc9c	nopl	(%rax)
