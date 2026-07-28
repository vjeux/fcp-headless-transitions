__ZNK17PCImageAttributes15getCacheHashKeyEv:
000000000004aa1c	pushq	%rbp
000000000004aa1d	movq	%rsp, %rbp
000000000004aa20	pushq	%r14
000000000004aa22	pushq	%rbx
000000000004aa23	movl	$0x1050, %eax                   ## imm = 0x1050
000000000004aa28	callq	0xde6d2                         ## symbol stub for: ____chkstk_darwin
000000000004aa2d	subq	%rax, %rsp
000000000004aa30	movq	%rsi, %r14
000000000004aa33	movq	%rdi, %rbx
000000000004aa36	movq	0xfd7e3(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
000000000004aa3d	movq	(%rax), %rax
000000000004aa40	movq	%rax, -0x18(%rbp)
000000000004aa44	leaq	-0x1058(%rbp), %rdi
000000000004aa4b	callq	__ZN17PCHashWriteStreamC1Ev     ## PCHashWriteStream::PCHashWriteStream()
000000000004aa50	movl	(%r14), %esi
000000000004aa53	leaq	-0x1058(%rbp), %rdi
000000000004aa5a	callq	__ZN17PCHashWriteStream10writeValueEi ## PCHashWriteStream::writeValue(int)
000000000004aa5f	movl	0x4(%r14), %esi
000000000004aa63	leaq	-0x1058(%rbp), %rdi
000000000004aa6a	callq	__ZN17PCHashWriteStream10writeValueEj ## PCHashWriteStream::writeValue(unsigned int)
000000000004aa6f	movl	0x8(%r14), %esi
000000000004aa73	leaq	-0x1058(%rbp), %rdi
000000000004aa7a	callq	__ZN17PCHashWriteStream10writeValueEj ## PCHashWriteStream::writeValue(unsigned int)
000000000004aa7f	movl	0xc(%r14), %esi
000000000004aa83	leaq	-0x1058(%rbp), %rdi
000000000004aa8a	callq	__ZN17PCHashWriteStream10writeValueEj ## PCHashWriteStream::writeValue(unsigned int)
000000000004aa8f	movl	0x10(%r14), %esi
000000000004aa93	leaq	-0x1058(%rbp), %rdi
000000000004aa9a	callq	__ZN17PCHashWriteStream10writeValueEj ## PCHashWriteStream::writeValue(unsigned int)
000000000004aa9f	movzbl	0x28(%r14), %esi
000000000004aaa4	leaq	-0x1058(%rbp), %rdi
000000000004aaab	callq	__ZN17PCHashWriteStream10writeValueEb ## PCHashWriteStream::writeValue(bool)
000000000004aab0	leaq	0x18(%r14), %rdi
000000000004aab4	callq	__ZNK18PCColorSpaceHandle15getCGColorSpaceEv ## PCColorSpaceHandle::getCGColorSpace() const
000000000004aab9	leaq	-0x1058(%rbp), %rdi
000000000004aac0	movq	%rax, %rsi
000000000004aac3	callq	__ZN17PCHashWriteStream10writeValueEPKv ## PCHashWriteStream::writeValue(void const*)
000000000004aac8	movl	0x20(%r14), %esi
000000000004aacc	leaq	-0x1058(%rbp), %rdi
000000000004aad3	callq	__ZN17PCHashWriteStream10writeValueEi ## PCHashWriteStream::writeValue(int)
000000000004aad8	movl	0x14(%r14), %esi
000000000004aadc	leaq	-0x1058(%rbp), %rdi
000000000004aae3	callq	__ZN17PCHashWriteStream10writeValueEi ## PCHashWriteStream::writeValue(int)
000000000004aae8	leaq	-0x1058(%rbp), %rdi
000000000004aaef	callq	__ZN17PCHashWriteStream7getHashEv ## PCHashWriteStream::getHash()
000000000004aaf4	movups	(%rax), %xmm0
000000000004aaf7	movups	%xmm0, (%rbx)
000000000004aafa	leaq	-0x1058(%rbp), %rdi
000000000004ab01	callq	__ZN17PCHashWriteStreamD1Ev     ## PCHashWriteStream::~PCHashWriteStream()
000000000004ab06	movq	0xfd713(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
000000000004ab0d	movq	(%rax), %rax
000000000004ab10	cmpq	-0x18(%rbp), %rax
000000000004ab14	jne	0x4ab25
000000000004ab16	movq	%rbx, %rax
000000000004ab19	addq	$0x1050, %rsp                   ## imm = 0x1050
000000000004ab20	popq	%rbx
000000000004ab21	popq	%r14
000000000004ab23	popq	%rbp
000000000004ab24	retq
000000000004ab25	callq	0xde744                         ## symbol stub for: ___stack_chk_fail
000000000004ab2a	movq	%rax, %rbx
000000000004ab2d	jmp	0x4ab3e
000000000004ab2f	movq	%rax, %rbx
000000000004ab32	leaq	-0x1058(%rbp), %rdi
000000000004ab39	callq	__ZN17PCHashWriteStreamD1Ev     ## PCHashWriteStream::~PCHashWriteStream()
000000000004ab3e	movq	%rbx, %rdi
000000000004ab41	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
