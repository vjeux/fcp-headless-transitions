__ZN13OZOrthoCamera13resetRotationEv:
0000000000040940	pushq	%rbp
0000000000040941	movq	%rsp, %rbp
0000000000040944	pushq	%rbx
0000000000040945	pushq	%rax
0000000000040946	movl	0x228(%rdi), %eax
000000000004094c	addl	$-0x2, %eax
000000000004094f	cmpl	$0x5, %eax
0000000000040952	ja	0x40a14
0000000000040958	leaq	0xfd(%rip), %rcx
000000000004095f	movslq	(%rcx,%rax,4), %rax
0000000000040963	addq	%rcx, %rax
0000000000040966	jmpq	*%rax
0000000000040968	movsd	0x6c65d8(%rip), %xmm0
0000000000040970	jmp	0x409dc
0000000000040972	xorps	%xmm0, %xmm0
0000000000040975	movups	%xmm0, 0x210(%rdi)
000000000004097c	movq	$0x0, 0x220(%rdi)
0000000000040987	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000040991	movq	%rax, 0x208(%rdi)
0000000000040998	jmp	0x40a43
000000000004099d	xorps	%xmm0, %xmm0
00000000000409a0	movups	%xmm0, 0x218(%rdi)
00000000000409a7	movaps	0x6c64d2(%rip), %xmm0
00000000000409ae	movups	%xmm0, 0x208(%rdi)
00000000000409b5	jmp	0x40a43
00000000000409ba	xorps	%xmm0, %xmm0
00000000000409bd	movups	%xmm0, 0x218(%rdi)
00000000000409c4	movaps	0x6c64a5(%rip), %xmm0
00000000000409cb	movups	%xmm0, 0x208(%rdi)
00000000000409d2	jmp	0x40a43
00000000000409d4	movsd	0x6c655c(%rip), %xmm0
00000000000409dc	movups	%xmm0, 0x218(%rdi)
00000000000409e3	movsd	0x6c6555(%rip), %xmm0
00000000000409eb	movups	%xmm0, 0x208(%rdi)
00000000000409f2	jmp	0x40a43
00000000000409f4	movsd	0x6c49e4(%rip), %xmm0
00000000000409fc	movups	%xmm0, 0x218(%rdi)
0000000000040a03	movsd	0x6c6525(%rip), %xmm0
0000000000040a0b	movups	%xmm0, 0x208(%rdi)
0000000000040a12	jmp	0x40a43
0000000000040a14	leaq	0x7854ad(%rip), %rax            ## literal pool for: "File %s, line %d should not have been reached:\n\t"
0000000000040a1b	leaq	0x78693d(%rip), %rsi            ## literal pool for: "/Library/Caches/com.apple.xbs/Sources/MotionSharedCode/Motion-45000.0.157/Ozone/CompositorObject/OZOrthoCamera.h"
0000000000040a22	leaq	0x7869a7(%rip), %rcx            ## literal pool for: "cameraType"
0000000000040a29	movq	%rdi, %rbx
0000000000040a2c	movq	%rax, %rdi
0000000000040a2f	movl	$0x46, %edx
0000000000040a34	xorl	%eax, %eax
0000000000040a36	callq	0x6dcebe                        ## symbol stub for: _PCPrint
0000000000040a3b	callq	0x6e0068                        ## symbol stub for: _pcAbortImpl
0000000000040a40	movq	%rbx, %rdi
0000000000040a43	leaq	0x208(%rdi), %rsi
0000000000040a4a	movq	(%rdi), %rax
0000000000040a4d	movq	0x1e0(%rax), %rax
0000000000040a54	addq	$0x8, %rsp
0000000000040a58	popq	%rbx
0000000000040a59	popq	%rbp
0000000000040a5a	jmpq	*%rax
0000000000040a5c	orb	$-0x1, %al
0000000000040a5e	.byte 0xff #bad opcode
0000000000040a5f	.byte 0xff #bad opcode
0000000000040a60	js	0x40a61
0000000000040a62	.byte 0xff #bad opcode
0000000000040a63	incl	-0x1(%rcx)
0000000000040a66	.byte 0xff #bad opcode
0000000000040a67	lcalll	*-0x1(%rsi)
0000000000040a6a	.byte 0xff #bad opcode
0000000000040a6b	callq	*(%rsi)
0000000000040a6d	.byte 0xff #bad opcode
0000000000040a6e	.byte 0xff #bad opcode
0000000000040a6f	lcalll	*0x66ffffff(%rax)
0000000000040a75	nopw	%cs:(%rax,%rax)
