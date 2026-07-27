__ZN7PCBlend9isAbelianE11PCBlendMode:
0000000000017f00	pushq	%rbp
0000000000017f01	movq	%rsp, %rbp
0000000000017f04	movl	%edi, %ecx
0000000000017f06	cmpl	$0x18, %edi
0000000000017f09	setb	%dl
0000000000017f0c	movl	$0xc00718, %eax                 ## imm = 0xC00718
0000000000017f11	shrl	%cl, %eax
0000000000017f13	andb	%dl, %al
0000000000017f15	popq	%rbp
0000000000017f16	retq
