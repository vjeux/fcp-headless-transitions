__ZN22OZSingleChanBehaviorIF14getNeededRangeEjP16OZCurveNodeParam:
00000000004c1de0	pushq	%rbp
00000000004c1de1	movq	%rsp, %rbp
00000000004c1de4	movq	%rdx, %rax
00000000004c1de7	movq	0x70(%rdx), %rcx
00000000004c1deb	movq	%rcx, 0x28(%rdx)
00000000004c1def	movups	0x60(%rdx), %xmm0
00000000004c1df3	movups	%xmm0, 0x18(%rdx)
00000000004c1df7	movups	0x78(%rdx), %xmm0
00000000004c1dfb	movups	%xmm0, 0x30(%rdx)
00000000004c1dff	movq	0x88(%rdx), %rcx
00000000004c1e06	movq	%rcx, 0x40(%rdx)
00000000004c1e0a	movl	0x90(%rdx), %ecx
00000000004c1e10	movl	%ecx, 0x48(%rdx)
00000000004c1e13	movb	$0x0, 0x58(%rdx)
00000000004c1e17	movq	0x98(%rdx), %rcx
00000000004c1e1e	movq	%rcx, 0x50(%rdx)
00000000004c1e22	popq	%rbp
00000000004c1e23	retq
00000000004c1e24	nopw	%cs:(%rax,%rax)
