__ZNK28FFOZBlindDataCustomUIChannel5cloneEv:
0000000000218fd0	pushq	%rbp
0000000000218fd1	movq	%rsp, %rbp
0000000000218fd4	pushq	%r14
0000000000218fd6	pushq	%rbx
0000000000218fd7	movq	%rdi, %r14
0000000000218fda	movl	$0x198, %edi                    ## imm = 0x198
0000000000218fdf	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000218fe4	movq	%rax, %rbx
0000000000218fe7	movq	%rax, %rdi
0000000000218fea	movq	%r14, %rsi
0000000000218fed	xorl	%edx, %edx
0000000000218fef	callq	0x1496696                       ## symbol stub for: __ZN18OZChannelBlindDataC2ERKS_P15OZChannelFolder
0000000000218ff4	leaq	0x16dbb5d(%rip), %rax
0000000000218ffb	movq	%rax, (%rbx)
0000000000218ffe	leaq	0x16dbeb3(%rip), %rax
0000000000219005	movq	%rax, 0x10(%rbx)
0000000000219009	movq	%rbx, %rax
000000000021900c	popq	%rbx
000000000021900d	popq	%r14
000000000021900f	popq	%rbp
0000000000219010	retq
0000000000219011	movq	%rax, %r14
0000000000219014	movq	%rbx, %rdi
0000000000219017	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000021901c	movq	%r14, %rdi
000000000021901f	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000219024	nopw	%cs:(%rax,%rax)
