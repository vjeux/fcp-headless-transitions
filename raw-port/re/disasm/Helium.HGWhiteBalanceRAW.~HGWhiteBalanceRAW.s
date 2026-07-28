__ZN17HGWhiteBalanceRAWD0Ev:
00000000001d2ba0	pushq	%rbp
00000000001d2ba1	movq	%rsp, %rbp
00000000001d2ba4	pushq	%rbx
00000000001d2ba5	pushq	%rax
00000000001d2ba6	movq	%rdi, %rbx
00000000001d2ba9	callq	__ZN18HgcWhiteBalanceRAWD2Ev    ## HgcWhiteBalanceRAW::~HgcWhiteBalanceRAW()
00000000001d2bae	movq	%rbx, %rdi
00000000001d2bb1	addq	$0x8, %rsp
00000000001d2bb5	popq	%rbx
00000000001d2bb6	popq	%rbp
00000000001d2bb7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001d2bbc	nopl	(%rax)
