
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000704a4 <__ZN18OZChannelHistogram10getWhiteInEi>:
   704a4: 55                           	pushq	%rbp
   704a5: 48 89 e5                     	movq	%rsp, %rbp
   704a8: 83 fe 04                     	cmpl	$0x4, %esi
   704ab: 77 3d                        	ja	0x704ea <__ZN18OZChannelHistogram10getWhiteInEi+0x46>
   704ad: 48 89 f8                     	movq	%rdi, %rax
   704b0: 89 f1                        	movl	%esi, %ecx
   704b2: 48 8d 15 37 00 00 00         	leaq	0x37(%rip), %rdx        ## 0x704f0 <__ZN18OZChannelHistogram10getWhiteInEi+0x4c>
   704b9: 48 63 0c 8a                  	movslq	(%rdx,%rcx,4), %rcx
   704bd: 48 01 d1                     	addq	%rdx, %rcx
   704c0: ff e1                        	jmpq	*%rcx
   704c2: 48 05 40 03 00 00            	addq	$0x340, %rax            ## imm = 0x340
   704c8: eb 22                        	jmp	0x704ec <__ZN18OZChannelHistogram10getWhiteInEi+0x48>
   704ca: 48 05 40 11 00 00            	addq	$0x1140, %rax           ## imm = 0x1140
   704d0: eb 1a                        	jmp	0x704ec <__ZN18OZChannelHistogram10getWhiteInEi+0x48>
   704d2: 48 05 40 0a 00 00            	addq	$0xa40, %rax            ## imm = 0xA40
   704d8: eb 12                        	jmp	0x704ec <__ZN18OZChannelHistogram10getWhiteInEi+0x48>
   704da: 48 05 c0 0d 00 00            	addq	$0xdc0, %rax            ## imm = 0xDC0
   704e0: eb 0a                        	jmp	0x704ec <__ZN18OZChannelHistogram10getWhiteInEi+0x48>
   704e2: 48 05 c0 06 00 00            	addq	$0x6c0, %rax            ## imm = 0x6C0
   704e8: eb 02                        	jmp	0x704ec <__ZN18OZChannelHistogram10getWhiteInEi+0x48>
   704ea: 31 c0                        	xorl	%eax, %eax
   704ec: 5d                           	popq	%rbp
   704ed: c3                           	retq
   704ee: 66 90                        	nop
   704f0: d2 ff                        	sarb	%cl, %bh
   704f2: ff ff                        	<unknown>
   704f4: f2 ff ff                     	<unknown>
   704f7: ff e2                        	jmpq	*%rdx
   704f9: ff ff                        	<unknown>
   704fb: ff ea                        	<unknown>
   704fd: ff ff                        	<unknown>
   704ff: ff da                        	<unknown>
   70501: ff ff                        	<unknown>
   70503: ff 55 48                     	callq	*0x48(%rbp)
