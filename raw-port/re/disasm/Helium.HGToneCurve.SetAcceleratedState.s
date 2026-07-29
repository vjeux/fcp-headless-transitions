__ZN11HGToneCurve19SetAcceleratedStateENS_27hgToneCurveAcceleratedStateE:
0000000000248820	pushq	%rbp
0000000000248821	movq	%rsp, %rbp
0000000000248824	xorl	%eax, %eax
0000000000248826	testl	%esi, %esi
0000000000248828	cmovgl	%esi, %eax
000000000024882b	cmpl	$0x8, %eax
000000000024882e	movl	$0x8, %ecx
0000000000248833	cmovll	%eax, %ecx
0000000000248836	movl	%ecx, 0x1a8(%rdi)
000000000024883c	popq	%rbp
000000000024883d	retq
000000000024883e	nop
