__ZN11PCVLCParser2ueEv:
000000000009dea4	pushq	%rbp
000000000009dea5	movq	%rsp, %rbp
000000000009dea8	pushq	%rbx
000000000009dea9	pushq	%rax
000000000009deaa	movl	0x1c(%rdi), %ebx
000000000009dead	addq	$0x18, %rdi
000000000009deb1	bsrl	%ebx, %eax
000000000009deb4	xorl	$0x1f, %eax
000000000009deb7	leal	0x1(,%rax,2), %esi
000000000009debe	movl	%eax, %ecx
000000000009dec0	addl	%eax, %ecx
000000000009dec2	notb	%cl
000000000009dec4	shrl	%cl, %ebx
000000000009dec6	decl	%ebx
000000000009dec8	callq	__ZN17PCBitstreamReader9flushBitsEi ## PCBitstreamReader::flushBits(int)
000000000009decd	movl	%ebx, %eax
000000000009decf	addq	$0x8, %rsp
000000000009ded3	popq	%rbx
000000000009ded4	popq	%rbp
000000000009ded5	retq
