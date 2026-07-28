__ZN11PCVLCParser2seEv:
000000000009ded6	pushq	%rbp
000000000009ded7	movq	%rsp, %rbp
000000000009deda	pushq	%rbx
000000000009dedb	pushq	%rax
000000000009dedc	movl	0x1c(%rdi), %ebx
000000000009dedf	addq	$0x18, %rdi
000000000009dee3	bsrl	%ebx, %eax
000000000009dee6	xorl	$0x1f, %eax
000000000009dee9	leal	0x1(,%rax,2), %esi
000000000009def0	movl	%eax, %ecx
000000000009def2	addl	%eax, %ecx
000000000009def4	notb	%cl
000000000009def6	shrl	%cl, %ebx
000000000009def8	callq	__ZN17PCBitstreamReader9flushBitsEi ## PCBitstreamReader::flushBits(int)
000000000009defd	movl	%ebx, %ecx
000000000009deff	andl	$0x1, %ecx
000000000009df02	shrl	%ebx
000000000009df04	movl	%ecx, %eax
000000000009df06	negl	%eax
000000000009df08	xorl	%ebx, %eax
000000000009df0a	addl	%ecx, %eax
000000000009df0c	addq	$0x8, %rsp
000000000009df10	popq	%rbx
000000000009df11	popq	%rbp
000000000009df12	retq
000000000009df13	nop
