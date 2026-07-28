__ZN13PCPixelFormat11removeAlphaENS_12ChannelOrderE:
00000000000355b8	pushq	%rbp
00000000000355b9	movq	%rsp, %rbp
00000000000355bc	leal	-0x8(%rdi), %eax
00000000000355bf	cmpl	$0x7, %eax
00000000000355c2	ja	0x355db
00000000000355c4	leaq	0x35(%rip), %rcx
00000000000355cb	movslq	(%rcx,%rax,4), %rax
00000000000355cf	addq	%rcx, %rax
00000000000355d2	jmpq	*%rax
00000000000355d4	movl	$0x7, %eax                              # order=8 -> 7
00000000000355d9	jmp	0x355fc
00000000000355db	movl	$0x1, %eax                              # default: assume order=2 -> 1
00000000000355e0	cmpl	$0x2, %edi
00000000000355e3	je	0x355fc
00000000000355e5	movl	%edi, %eax                              # else return edi unchanged
00000000000355e7	jmp	0x355fc
00000000000355e9	movl	$0xb, %eax                              # order=12 -> 11
00000000000355ee	jmp	0x355fc
00000000000355f0	movl	$0xe, %eax                              # order=15 -> 14
00000000000355f5	jmp	0x355fc
00000000000355f7	movl	$0x9, %eax                              # order=10 -> 9
00000000000355fc	popq	%rbp
00000000000355fd	retq
# jump table @0x35600, 8 entries × 4 bytes (rcx-relative):
# order_in=8:  disp=-0x2c -> target=0x355d4 (return 7)
# order_in=9:  disp=-0x1b -> target=0x355e5 (return edi unchanged)
# order_in=10: disp=-0x9  -> target=0x355f7 (return 9)
# order_in=11: disp=-0x1b -> target=0x355e5 (return edi unchanged)
# order_in=12: disp=-0x17 -> target=0x355e9 (return 11)
# order_in=13: disp=-0x1b -> target=0x355e5 (return edi unchanged)
# order_in=14: disp=-0x1b -> target=0x355e5 (return edi unchanged)
# order_in=15: disp=-0x10 -> target=0x355f0 (return 14)
