__ZN30HGCRetimeWithFlowInterpFullRezD0Ev:
00000000000e1380	pushq	%rbp
00000000000e1381	movq	%rsp, %rbp
00000000000e1384	pushq	%rbx
00000000000e1385	pushq	%rax
00000000000e1386	movq	%rdi, %rbx
00000000000e1389	callq	__ZN30HgcRetimeWithFlowInterpFullRezD2Ev ## HgcRetimeWithFlowInterpFullRez::~HgcRetimeWithFlowInterpFullRez()
00000000000e138e	movq	%rbx, %rdi
00000000000e1391	addq	$0x8, %rsp
00000000000e1395	popq	%rbx
00000000000e1396	popq	%rbp
00000000000e1397	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e139c	nopl	(%rax)
